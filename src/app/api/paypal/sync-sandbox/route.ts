import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { clientId, clientSecret } = await request.json();

    const activeClientId = clientId || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const activeClientSecret = clientSecret || process.env.PAYPAL_CLIENT_SECRET;

    if (!activeClientId || !activeClientSecret) {
      return NextResponse.json({ error: 'PayPal Client ID and Secret are required' }, { status: 400 });
    }

    // Authenticate with PayPal REST API v2 Sandbox
    const auth = Buffer.from(`${activeClientId}:${activeClientSecret}`).toString('base64');
    
    const tokenRes = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      return NextResponse.json({ error: tokenData.error_description || 'Failed to authenticate with PayPal Sandbox' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully connected to PayPal Developer Dashboard Sandbox!',
      scope: tokenData.scope,
      appId: tokenData.app_id,
      status: 'VERIFIED_SANDBOX',
    });
  } catch (error: any) {
    console.error('PayPal sync error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}