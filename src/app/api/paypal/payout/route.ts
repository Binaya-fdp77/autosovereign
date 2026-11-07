import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const contractId = body.contractId;
    const db = prisma as any;

    let contract = contractId 
      ? await db.contract.findUnique({ where: { id: contractId }, include: { seller: true } })
      : await db.contract.findFirst({ where: { status: 'LOCKED_IN_ESCROW' }, include: { seller: true }, orderBy: { createdAt: 'desc' } });

    if (!contract) {
      return NextResponse.json({ success: false, error: 'No eligible contract found for payout waterfall.' }, { status: 404 });
    }

    // Simulate Payout Waterfall calculation (90% Seller, 5% Platform, 5% Contingency)
    const totalAmount = parseFloat(contract.totalAmount.toString());
    const sellerPayout = totalAmount * 0.90;
    const platformFee = totalAmount * 0.05;
    const contingencyReserve = totalAmount * 0.05;

    // Update contract status to RELEASED
    await db.contract.update({
      where: { id: contract.id },
      data: { status: 'RELEASED' }
    });

    // Log telemetry for Payout Waterfall
    await db.agentLog.create({
      data: {
        agentRole: 'PAYPAL_PAYOUT_WATERFALL',
        action: 'EXECUTE_BATCH_PAYOUT',
        payload: JSON.stringify({
          contractId: contract.id,
          totalAmount,
          sellerPayout,
          platformFee,
          contingencyReserve,
          recipientEmail: contract.seller?.paypalEmail || 'seller@autosovereign.test'
        }),
        contractId: contract.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payout waterfall executed successfully!',
      payoutDetails: {
        contractId: contract.id,
        totalAmount,
        sellerPayout,
        platformFee,
        contingencyReserve,
        status: 'RELEASED'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}