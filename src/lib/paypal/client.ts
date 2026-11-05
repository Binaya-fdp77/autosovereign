const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'sandbox_client_id_placeholder';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || 'sandbox_client_secret_placeholder';
const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';

export interface PayPalRequestOptions extends Omit<RequestInit, 'body'> {
  body?: any;
}

export const paypalClient = {
  async getAccessToken(): Promise<string> {
    if (PAYPAL_CLIENT_ID.includes('placeholder')) {
      return 'mock_access_token_12345';
    }
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      body: 'grant_type=client_credentials',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    const data = await response.json();
    return data.access_token;
  },

  async request<T = any>(endpoint: string, options: PayPalRequestOptions = {}): Promise<T> {
    const token = await this.getAccessToken();
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    };

    if (PAYPAL_CLIENT_ID.includes('placeholder')) {
      return { status: 'COMPLETED', mock: true, id: `mock_res_${Date.now()}` } as unknown as T;
    }

    const body = options.body && typeof options.body !== 'string' 
      ? JSON.stringify(options.body) 
      : options.body;

    const res = await fetch(`${PAYPAL_API_BASE}${endpoint}`, {
      ...options,
      body,
      headers,
    });
    return res.json() as Promise<T>;
  },

  async createOrder(amount: string, currency: string = 'USD', contractId: string) {
    if (PAYPAL_CLIENT_ID.includes('placeholder')) {
      return {
        id: `MOCK_ORDER_${Date.now()}`,
        status: 'CREATED',
        links: [
          {
            href: `http://localhost:3000/dashboard?mock_success=true&contractId=${contractId}`,
            rel: 'approve',
            method: 'GET',
          },
        ],
      };
    }
    return this.request('/v2/checkout/orders', {
      method: 'POST',
      body: {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: { currency_code: currency, value: amount },
            custom_id: contractId,
          },
        ],
      },
    });
  },
};