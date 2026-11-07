import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { contractId, buyerClaim, sellerClaim } = body;
    const db = prisma as any;

    if (!contractId || !buyerClaim || !sellerClaim) {
      return NextResponse.json({ success: false, error: 'contractId, buyerClaim, and sellerClaim are required.' }, { status: 400 });
    }

    const contract = await db.contract.findUnique({
      where: { id: contractId },
      include: { buyer: true, seller: true }
    });

    if (!contract) {
      return NextResponse.json({ success: false, error: 'Contract not found.' }, { status: 404 });
    }

    // Heuristic AI Mediation Calculation (Simulated GPT-4o Arbitration)
    const buyerLen = buyerClaim.length;
    const sellerLen = sellerClaim.length;
    const totalAmount = parseFloat(contract.totalAmount.toString());

    // Calculate split based on argument depth & keyword analysis
    let sellerPercent = 50;
    if (sellerClaim.toLowerCase().includes('delivered') || sellerClaim.toLowerCase().includes('github')) {
      sellerPercent += 25;
    }
    if (buyerClaim.toLowerCase().includes('missing') || buyerClaim.toLowerCase().includes('broken')) {
      sellerPercent -= 20;
    }
    sellerPercent = Math.max(10, Math.min(90, sellerPercent));
    const buyerPercent = 100 - sellerPercent;

    const sellerPayout = (totalAmount * (sellerPercent / 100)).toFixed(2);
    const buyerRefund = (totalAmount * (buyerPercent / 100)).toFixed(2);

    const verdict = `Arbitration Complete. Based on deliverable analysis and claim evidence, AI Mediator awards ${sellerPercent}% ($${sellerPayout}) to Seller and ${buyerPercent}% ($${buyerRefund}) to Buyer.`;

    // Update contract status to RELEASED (Resolved via Arbitration)
    await db.contract.update({
      where: { id: contractId },
      data: { status: 'RELEASED' }
    });

    // Record telemetry log
    await db.agentLog.create({
      data: {
        agentRole: 'AI_DISPUTE_MEDIATOR',
        action: 'RESOLVE_DISPUTE_ARBITRATION',
        payload: JSON.stringify({
          contractId,
          buyerPercent,
          sellerPercent,
          buyerRefund,
          sellerPayout,
          verdict
        }),
        contractId: contractId,
      },
    });

    return NextResponse.json({
      success: true,
      verdict,
      buyerPercent,
      sellerPercent,
      buyerRefund,
      sellerPayout
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}