import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: Request) {
  try {
    const { eventType, contractId } = await request.json();
    const db = prisma as any;

    let targetContractId = contractId;
    if (!targetContractId) {
      const firstContract = await db.contract.findFirst();
      targetContractId = firstContract?.id;
    }

    if (!targetContractId) {
      return NextResponse.json({ success: false, error: 'No contract found to simulate webhook for.' }, { status: 400 });
    }

    // Map simulated PayPal event type to exact schema ContractStatus enum values
    let newStatus = 'LOCKED_IN_ESCROW';
    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      newStatus = 'LOCKED_IN_ESCROW';
    } else if (eventType === 'PAYOUTS.ITEM.SUCCEEDED') {
      newStatus = 'RELEASED';
    } else if (eventType === 'PAYMENT.CAPTURE.DENIED') {
      newStatus = 'DISPUTED';
    }

    // Update contract status in DB
    const updatedContract = await db.contract.update({
      where: { id: targetContractId },
      data: { status: newStatus },
    });

    // Log telemetry
    await db.agentLog.create({
      data: {
        agentRole: 'PAYPAL_LISTENER',
        action: `WEBHOOK_${eventType}`,
        payload: JSON.stringify({ eventType, targetContractId, updatedStatus: newStatus }),
        contract: { connect: { id: targetContractId } },
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: `Simulated ${eventType} successfully processed.`,
      contract: updatedContract 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}