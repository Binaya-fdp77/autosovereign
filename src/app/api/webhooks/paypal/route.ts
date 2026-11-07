import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const eventType = body.event_type || 'SIMULATED_WEBHOOK_EVENT';
    const resource = body.resource || {};
    const db = prisma as any;

    // Find a contract to attach telemetry to, or pick the latest one
    let contract = await db.contract.findFirst({ orderBy: { createdAt: 'desc' } });

    if (contract) {
      // If it's a capture completed event, update status to LOCKED_IN_ESCROW
      if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
        await db.contract.update({
          where: { id: contract.id },
          data: { status: 'LOCKED_IN_ESCROW' }
        });
      }

      // Record agent / listener telemetry log
      await db.agentLog.create({
        data: {
          agentRole: 'PAYPAL_LISTENER',
          action: `WEBHOOK_${eventType}`,
          payload: JSON.stringify(resource),
          contractId: contract.id,
        },
      });
    }

    return NextResponse.json({ success: true, receivedEvent: eventType });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}