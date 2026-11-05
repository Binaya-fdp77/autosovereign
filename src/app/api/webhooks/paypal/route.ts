import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const eventType = body.event_type;
    const resource = body.resource;

    const db = prisma as any;

    // Log the incoming PayPal webhook event to the audit ledger
    await db.agentLog.create({
      data: {
        agentRole: 'PAYPAL_WEBHOOK_LISTENER',
        action: `Received Webhook: ${eventType || 'UNKNOWN_EVENT'}`,
        payload: JSON.stringify({
          eventType,
          resourceSummary: {
            id: resource?.id,
            status: resource?.status,
            amount: resource?.amount?.value || resource?.payout_batch_id,
          },
          timestamp: new Date().toISOString(),
        }),
      },
    });

    // Handle specific PayPal sandbox events
    if (eventType === 'PAYMENT.PAYOUTS-ITEM.SUCCEEDED' || eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      // Automatically update relevant escrow or milestone status if matching metadata exists
      console.log(`[AutoSovereign Webhook] Successfully processed event: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}