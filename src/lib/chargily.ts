export interface ChargilyCheckoutPayload {
  amount: number;
  currency?: 'dzd';
  successUrl: string;
  failureUrl: string;
  webhookEndpoint?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface ChargilyCheckout {
  id: string;
  checkoutUrl: string;
  status?: string;
}

const CHARGILY_API_URL = 'https://pay.chargily.net/test/api/v2';

function getChargilySecretKey() {
  const secretKey = process.env.CHARGILY_SECRET_KEY;
  if (!secretKey) throw new Error('Missing CHARGILY_SECRET_KEY in .env.local');
  return secretKey;
}

export async function createChargilyCheckout(payload: ChargilyCheckoutPayload): Promise<ChargilyCheckout> {
  const res = await fetch(`${process.env.CHARGILY_API_URL || CHARGILY_API_URL}/checkouts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getChargilySecretKey()}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(payload.amount),
      currency: payload.currency || 'dzd',
      success_url: payload.successUrl,
      failure_url: payload.failureUrl,
      webhook_endpoint: payload.webhookEndpoint,
      metadata: payload.metadata,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || `Chargily checkout failed with status ${res.status}`);
  }

  return {
    id: data.id,
    checkoutUrl: data.checkout_url || data.checkoutUrl || data.url,
    status: data.status,
  };
}

export async function verifyChargilyWebhook(rawBody: string, signature: string | null) {
  const webhookSecret = process.env.CHARGILY_WEBHOOK_SECRET || process.env.CHARGILY_SECRET_KEY;
  if (!webhookSecret) throw new Error('Missing CHARGILY_SECRET_KEY in .env.local');
  if (!signature) return false;

  const crypto = await import('crypto');
  const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}
