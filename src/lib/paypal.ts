const BASE = process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";
let cached: { token: string; exp: number } | null = null;

export async function getPayPalAccessToken(force = false): Promise<string> {
  if (!force && cached && Date.now() < cached.exp) return cached.token;
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) throw new Error("Missing PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET");
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`PayPal auth failed: ${JSON.stringify(data)}`);
  cached = { token: data.access_token, exp: Date.now() + (Number(data.expires_in) - 120) * 1000 };
  return cached.token;
}

export async function paypalRequest<T = any>(
  path: string,
  opts: { method?: string; body?: unknown; requestId?: string; mock?: string } = {}
): Promise<T> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const token = await getPayPalAccessToken(attempt > 0);
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    if (opts.requestId) headers["PayPal-Request-Id"] = opts.requestId;
    if (opts.mock && BASE.includes("sandbox"))
      headers["PayPal-Mock-Response"] = JSON.stringify({ mock_application_codes: opts.mock });
    const res = await fetch(BASE + path, {
      method: opts.method || "GET",
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
    if (res.status === 401 && attempt === 0) { cached = null; continue; }
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    if (!res.ok) {
      const err: any = new Error(data.message || `PayPal ${res.status}`);
      err.status = res.status;
      err.details = data;
      throw err;
    }
    return data as T;
  }
  throw new Error("PayPal request failed after token refresh");
}