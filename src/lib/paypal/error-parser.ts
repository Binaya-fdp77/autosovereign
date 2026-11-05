import { NextResponse } from 'next/server';

export interface PayPalErrorDetail {
  field?: string;
  value?: string;
  location?: string;
  issue: string;
  description?: string;
}

export interface PayPalErrorResponse {
  name: string;
  message: string;
  debug_id: string;
  details?: PayPalErrorDetail[];
  links?: Array<{ href: string; rel: string; method: string }>;
}

export class PayPalAPIError extends Error {
  public readonly statusCode: number;
  public readonly debugId: string;
  public readonly issue: string;
  public readonly details: PayPalErrorDetail[];

  constructor(statusCode: number, payload: PayPalErrorResponse) {
    const primaryIssue = payload.details?.[0]?.issue || payload.name || 'UNKNOWN_PAYPAL_ERROR';
    const description = payload.details?.[0]?.description || payload.message || 'An error occurred with PayPal API';

    super(`[PayPal API ${statusCode}] ${primaryIssue}: ${description} (Debug ID: ${payload.debug_id || 'N/A'})`);

    this.name = 'PayPalAPIError';
    this.statusCode = statusCode;
    this.debugId = payload.debug_id || 'N/A';
    this.issue = primaryIssue;
    this.details = payload.details || [];
  }
}

export function parsePayPalError(error: unknown): {
  statusCode: number;
  issue: string;
  message: string;
  debugId: string;
  details: PayPalErrorDetail[];
} {
  if (error instanceof PayPalAPIError) {
    return {
      statusCode: error.statusCode,
      issue: error.issue,
      message: error.message,
      debugId: error.debugId,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      issue: 'INTERNAL_SERVER_ERROR',
      message: error.message,
      debugId: 'LOCAL_ERR',
      details: [],
    };
  }

  return {
    statusCode: 500,
    issue: 'UNHANDLED_EXCEPTION',
    message: 'An unknown fatal error occurred.',
    debugId: 'UNK_ERR',
    details: [],
  };
}

export function handlePayPalNegativeTesting(
  headers: Record<string, string>,
  mockHeader?: 'INSTRUMENT_DECLINED' | 'DUPLICATE_INVOICE_ID' | 'RESOURCE_NOT_FOUND'
): Record<string, string> {
  const updatedHeaders = { ...headers };
  if (mockHeader) {
    switch (mockHeader) {
      case 'INSTRUMENT_DECLINED':
        updatedHeaders['PayPal-Mock-Response'] = JSON.stringify({
          mock_application_codes: 'INSTRUMENT_DECLINED',
        });
        break;
      case 'DUPLICATE_INVOICE_ID':
        updatedHeaders['PayPal-Mock-Response'] = JSON.stringify({
          mock_application_codes: 'DUPLICATE_INVOICE_ID',
        });
        break;
      case 'RESOURCE_NOT_FOUND':
        updatedHeaders['PayPal-Mock-Response'] = JSON.stringify({
          mock_application_codes: 'RESOURCE_NOT_FOUND',
        });
        break;
    }
  }
  return updatedHeaders;
}
