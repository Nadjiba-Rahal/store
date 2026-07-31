import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ShippingCompany from '@/models/ShippingCompany';

export const dynamic = 'force-dynamic';

// GET /api/shipping/rates?courierName=Yalidine&wilayaCode=16
// Returns the active courier's fee row for that wilaya (home/desk), used by
// the buyer checkout to display the live shipping cost.
export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const courierName = searchParams.get('courierName');
  const wilayaCode = searchParams.get('wilayaCode');

  if (!courierName) {
    return NextResponse.json({ rates: [] });
  }

  const companyDoc = await ShippingCompany.findOne({ name: courierName, isActive: true }).lean();
  if (!companyDoc) return NextResponse.json({ rates: [] });
  const company = companyDoc as unknown as {
    rates: { wilayaCode: number; wilayaName: string; homeFee: number; deskFee: number; isServiced: boolean }[];
  };

  const rows = wilayaCode
    ? company.rates.filter((r) => Number(r.wilayaCode) === Number(wilayaCode))
    : company.rates;

  const rates = rows.map((r) => ({
    wilayaCode: String(r.wilayaCode).padStart(2, '0'),
    wilayaName: r.wilayaName,
    homeFee: r.homeFee,
    deskFee: r.deskFee,
    isServiced: r.isServiced,
  }));

  return NextResponse.json({ rates });
}
