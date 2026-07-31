import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import ShippingCompany, { buildEmptyRateTable } from '@/models/ShippingCompany';
import { ALGERIA_WILAYAS } from '@/data/wilayas';

export const dynamic = 'force-dynamic';

interface ParsedRate {
  wilayaCode: string | number;
  wilayaName: string;
  homeFee: number;
  deskFee: number;
}

// Vision models fallback chain
const VISION_MODELS = [
  process.env.OPENROUTER_VISION_MODEL,
  'google/gemini-2.5-flash',
  'nvidia/nemotron-nano-12b-v2-vl:free',
  'meta-llama/llama-3.2-11b-vision-instruct:free',
  'google/gemma-4-31b-it:free',
  'openrouter/free'
].filter(Boolean) as string[];

/**
 * Helper function to find the most frequent non-zero value (Mode) in an array
 */
function getMostFrequentValue(numbers: number[]): number {
  const validNumbers = numbers.filter((n) => n > 0);
  if (validNumbers.length === 0) return 600; // Default fallback in DZD if no rates found

  const frequencyMap = new Map<number, number>();
  let maxCount = 0;
  let mostFrequent = validNumbers[0];

  for (const num of validNumbers) {
    const count = (frequencyMap.get(num) || 0) + 1;
    frequencyMap.set(num, count);
    if (count > maxCount) {
      maxCount = count;
      mostFrequent = num;
    }
  }

  return mostFrequent;
}

async function parseShippingChartWithVision(imageDataUrl: string, courierName: string): Promise<ParsedRate[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('Missing OPENROUTER_API_KEY in .env.local');

  let lastError = '';

  for (const model of VISION_MODELS) {
    try {
      console.log(`[OCR] Extracting rates with model: ${model}`);
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Sela Marketplace',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text:
                    `Extract ${courierName} Algerian shipping fees (Domicile/Home and Bureau/Stopdesk/Desk) from this ` +
                    'price-chart image. Algeria has 69 official wilayas, numbered 01-69. Match each row in the image to ' +
                    'its wilaya code and name as precisely as possible. Respond with NOTHING except a raw JSON array ' +
                    '(no markdown fences, no commentary, no safety notes) of objects with this exact shape: ' +
                    '{ "wilayaCode": number, "wilayaName": string, "homeFee": number, "deskFee": number }. ' +
                    'Use plain numbers (no currency symbols). Only include wilayas that actually appear in the image.',
                },
                { type: 'image_url', image_url: { url: imageDataUrl } },
              ],
            },
          ],
          temperature: 0,
          max_tokens: 4000,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        lastError = data?.error?.message || `Model ${model} returned status ${res.status}`;
        console.warn(`[OCR Warning] Model ${model} failed:`, lastError);
        continue;
      }

      const content: string = data?.choices?.[0]?.message?.content || '[]';
      const withoutFences = content.replace(/```json|```/gi, '').trim();
      const match = withoutFences.match(/\[[\s\S]*\]/);
      const json = match ? match[0] : withoutFences;

      return JSON.parse(json);
    } catch (err: any) {
      lastError = err?.message || 'Failed to parse JSON';
      console.warn(`[OCR Error] Exception with model ${model}:`, lastError);
    }
  }

  throw new Error(`Tous les modèles de vision ont échoué. Dernière erreur: ${lastError}`);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.shopId) {
      return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
    }

    const formData = await req.formData();
    const companyId = String(formData.get('companyId') || '');
    const courierName = String(formData.get('courierName') || '');
    const file = formData.get('file');

    if (!courierName || !(file instanceof File)) {
      return NextResponse.json({ error: 'Image et nom du transporteur requis.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const imageDataUrl = `data:${file.type || 'image/png'};base64,${buffer.toString('base64')}`;
    
    const parsedRates = await parseShippingChartWithVision(imageDataUrl, courierName);

    await connectDB();

    let company = companyId ? await ShippingCompany.findById(companyId) : null;
    if (!company) {
      company = await ShippingCompany.findOne({ name: courierName });
    }
    if (!company) {
      company = await ShippingCompany.create({
        name: courierName,
        isActive: true,
        rates: buildEmptyRateTable(),
      });
    }

    // 1. Collect parsed fees to calculate common defaults
    const homeFees: number[] = [];
    const deskFees: number[] = [];

    const parsedMap = new Map<number, ParsedRate>();
    for (const parsed of parsedRates) {
      const code = Number(parsed.wilayaCode);
      if (ALGERIA_WILAYAS.some((w) => Number(w.code) === code)) {
        parsedMap.set(code, parsed);
        if (parsed.homeFee > 0) homeFees.push(Number(parsed.homeFee));
        if (parsed.deskFee > 0) deskFees.push(Number(parsed.deskFee));
      }
    }

    // 2. Compute most frequent values (Mode) for missing entries
    const defaultHomeFee = getMostFrequentValue(homeFees);
    const defaultDeskFee = getMostFrequentValue(deskFees);

    // 3. Build/update table for ALL 69 Wilayas
    const updatedRates = ALGERIA_WILAYAS.map((wilaya) => {
      const code = Number(wilaya.code);
      const parsed = parsedMap.get(code);

      if (parsed) {
        // Exact match from AI image scan
        return {
          wilayaCode: code,
          wilayaName: wilaya.name,
          homeFee: Number(parsed.homeFee) || defaultHomeFee,
          deskFee: Number(parsed.deskFee) || defaultDeskFee,
          isServiced: true,
        };
      } else {
        // Missing from image: auto-fill with standard mode rates
        return {
          wilayaCode: code,
          wilayaName: wilaya.name,
          homeFee: defaultHomeFee,
          deskFee: defaultDeskFee,
          isServiced: true,
        };
      }
    });

    company.rates = updatedRates as any;
    await company.save();

    return NextResponse.json({
      company,
      matched: parsedRates.length,
      defaultHomeFee,
      defaultDeskFee,
    });
  } catch (error: any) {
    console.error('OCR Route Error:', error);
    return NextResponse.json(
      { error: error?.message || "Erreur lors de l'analyse de l'image." },
      { status: 500 }
    );
  }
}