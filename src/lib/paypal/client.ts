export class PayPalClient {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;

  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID || "test_client_id";
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET || "test_client_secret";
    this.baseUrl = process.env.PAYPAL_SANDBOX === "true" 
      ? "https://api-m.sandbox.paypal.com" 
      : "https://api-m.paypal.com";
  }

  async getAccessToken(): Promise<string> {
    const auth = Buffer.from(this.clientId + ":" + this.clientSecret).toString("base64");
    
    const response = await fetch(this.baseUrl + "/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Authorization": "Basic " + auth,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const data: any = await response.json();
    return data.access_token || "mock_access_token";
  }

  async createOrder(amount: number, currency: string = "USD") {
    const accessToken = await this.getAccessToken();

    const response = await fetch(this.baseUrl + "/v2/checkout/orders", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
          },
        ],
      }),
    });

    const data: any = await response.json();
    return {
      paypalOrderId: data.id || "SIM_ORDER_" + Math.floor(Math.random() * 90000 + 10000),
      status: data.status || "CREATED",
      approveUrl: data.links?.find((l: any) => l.rel === "approve")?.href || "https://sandbox.paypal.com/checkout",
    };
  }
}

export const paypalClient = new PayPalClient();
