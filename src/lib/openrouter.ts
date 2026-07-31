// src/lib/openrouter.ts

export async function generateProductDescription(input: {
  name: string;
  category: string;
  keywords?: string;
}): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENROUTER_API_KEY in .env.local');
  }

  const prompt = `Tu es un vendeur algérien qui rédige des fiches produit pour un marketplace local appelé Sela.
Écris une description de vente courte (3 à 4 phrases), chaleureuse et convaincante, en français, pour ce produit :
Nom du produit : ${input.name}
Catégorie : ${input.category}
${input.keywords ? `Mots-clés / détails fournis par le vendeur : ${input.keywords}` : ''}
Ne mets pas de titre, pas de guillemets, juste le texte de la description, Directives de style :
1. **Ton & Style :** Utilise un français parlé et chaleureux comme les vendeurs algériens en ligne (utilise de légères touches d'expressions locales bien placées comme "Salam!", "Marhaba bikoum", "Top qualité", "Livraison disponible 58 wilayas" si ça s'y prête).
2. **Accroche :** Commence direct par donner envie d'acheter sans fioritures inutiles.`;

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Sela Marketplace',
    },
    body: JSON.stringify({
      // "openrouter/free" automatically picks an active zero-cost model!
      model: 'openrouter/free',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter API error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  
  if (!text) throw new Error('OpenRouter returned empty response');
  
  return text.trim();
}