import 'server-only';
import { PayPalAPIError, handlePayPalNegativeTesting } from './error-parser';

interface OAuthTokenCache {
  accessToken: string;
  expiresAt: number; // Unix epoch ms
}

class PayPalClientManager {
  private static instance: PayPalClientManager;
  private tokenCache: OAuthTokenCache | null = null;
  private tokenFetchPromise: Promise<string> | null = null;

  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  private constructor() {
    this.baseUrl = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';
    this.clientId = process.env.PAYPAL_CLIENT_ID || '';
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';

    if (!this.clientId || !this.clientSecret) {
      throw new Error('FATAL: PayPal OAuth credentials missing from environment variables.');
    }
  }

  public static getInstance(): PayPalClientManager {
    if (!PayPalClientManager.instance) {
      PayPalClientManager.instance = new PayPalClientManager();
    }
    return PayPalClientManager.instance;
  }

  /**
   * Thread-safe access token retrieval with proactive refresh window (buffer: 5 minutes)
   */
  public async getAccessToken(): Promise<string> {
    const now = Date.now();
    const PROACTIVE_REFRESH_BUFFER_MS = 5 * 60 * 1000;

    if (this.tokenCache && this.tokenCache.expiresAt - now > PROACTIVE_REFRESH_BUFFER_MS) {
      return this.tokenCache.accessToken;
    }

    // Lock concurrent requests to prevent multiple token fetch calls
    if (this.tokenFetchPromise) {
      return this.tokenFetchPromise;
    }

    this.tokenFetchPromise = (async () => {
      try {
        const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
        const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'grant_type=client_credentials',
          cache: 'no-store',
        });

        const data = await response.json();

        if (!response.ok) {
          throw new PayPalAPIError(response.status, data);
        }

        const expiresInMs = (data.expires_in || 32400) * 1000; // Default 9 hours
        this.tokenCache = {
          accessToken: data.access_token,
          expiresAt: Date.now() + expiresInMs,
        };

        return data.access_token;
      } finally {
        this.tokenFetchPromise = null;
      }
    })();

    return this.tokenFetchPromise;
  }

  /**
   * Generic PayPal REST API v2 request wrapper
   */
  public async request<T>(
    endpoint: string,
    options: {
      method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
      body?: unknown;
      headers?: Record<string, string>;
      negativeTestingMock?: 'INSTRUMENT_DECLINED' | 'DUPLICATE_INVOICE_ID' | 'RESOURCE_NOT_FOUND';
    }
  ): Promise<T> {
    const accessToken = await this.getAccessToken();

    let defaultHeaders: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    };

    if (options.negativeTestingMock) {
      defaultHeaders = handlePayPalNegativeTesting(defaultHeaders, options.negativeTestingMock);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: options.method,
      headers: defaultHeaders,
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new PayPalAPIError(response.status, data);
    }

    return data as T;
  }
}

export const paypalClient = PayPalClientManager.getInstance();
