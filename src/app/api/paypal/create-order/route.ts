import { NextResponse } from 'next/server';
import { paypalClient } from '@/lib/paypal/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency, contractId } = body;

    if (!amount || !contractId) {
      return NextResponse.json({ error: 'Amount and contractId are required' }, { status: 400 });
    }

    const order = await paypalClient.request('/v2/checkout/orders', {
      method: 'POST',
      body: {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: contractId,
            description: `AutoSovereign Escrow for Contract ${contractId}`,
            custom_id: contractId,
            amount: { currency_code: currency || 'USD', value: amount },
          },
        ],
        application_context: {
          return_url: `${request.headers.get('origin') || 'http://localhost:3000'}/dashboard?success=true`,
          cancel_url: `${request.headers.get('origin') || 'http://localhost:3000'}/dashboard?cancel=true`,
          user_action: 'PAY_NOW',
        },
      },
    });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}