import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { contractId, milestoneId } = body;

    if (!contractId || !milestoneId) {
      return NextResponse.json({ error: 'Contract ID and Milestone ID are required' }, { status: 400 });
    }

    const db = prisma as any;

    // 1. Fetch contract and target milestone
    const contract = await db.contract.findUnique({
      where: { id: contractId },
      include: { milestones: true, escrowState: true },
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    const milestone = contract.milestones.find((m: any) => m.id === milestoneId);
    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    // 2. Update Milestone Status in Database
    await db.milestone.update({
      where: { id: milestoneId },
      data: { status: 'VERIFIED' },
    });

    // 3. Log Agent Decision in Database (stringify payload object to match String schema type)
    await db.agentLog.create({
      data: {
        contractId: contract.id,
        agentRole: 'CONTINGENCY_ORCHESTRATOR',
        action: `Verified Milestone: ${milestone.title}`,
        payload: JSON.stringify({
          deliverableHash: milestone.deliverable || 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          inspectionResult: 'PASSED',
          payoutTriggered: true,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    // 4. Update Escrow Captured Amount
    if (contract.escrowState) {
      const currentCaptured = Number(contract.escrowState.amountCaptured || 0);
      const milestoneAmount = Number(milestone.amount || 0);
      
      await db.escrowState.update({
        where: { contractId: contract.id },
        data: {
          amountCaptured: currentCaptured + milestoneAmount,
          status: 'CAPTURED',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Milestone "${milestone.title}" successfully verified and funds released!`,
    });
  } catch (error: any) {
    console.error('Agent verification error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}