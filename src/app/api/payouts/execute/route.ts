import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { paypalClient } from '@/lib/paypal/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { contractId, recipientEmail, amount } = body;

    if (!contractId || !recipientEmail || !amount) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const payload = {
      sender_batch_header: {
        sender_batch_id: `batch_${Date.now()}`,
        email_subject: 'You have received an AutoSovereign Escrow Payout!',
        email_message: 'Your milestone deliverable has been verified by the autonomous contingency agent.',
      },
      items: [
        {
          recipient_type: 'EMAIL',
          amount: { value: Number(amount).toFixed(2), currency: 'USD' },
          note: `Payout for contract ${contractId}`,
          sender_item_id: `item_${Date.now()}`,
          receiver: recipientEmail,
        },
      ],
    };

    const res = await paypalClient.request('/v1/payments/payouts', {
      method: 'POST',
      body: payload,
    });

    return NextResponse.json({ success: true, payoutResponse: res });
  } catch (error: any) {
    console.error('Payout error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}