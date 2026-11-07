import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { contractId, status } = body;
    const db = prisma as any;

    if (!contractId || !status) {
      return NextResponse.json({ success: false, error: 'contractId and status are required.' }, { status: 400 });
    }

    const updatedContract = await db.contract.update({
      where: { id: contractId },
      data: { status }
    });

    // Record telemetry log
    await db.agentLog.create({
      data: {
        agentRole: 'MEDIATOR',
        action: `MANUAL_STATUS_CHANGE_${status}`,
        payload: JSON.stringify({ contractId, status }),
        contractId: contractId,
      },
    });

    return NextResponse.json({ success: true, contract: updatedContract });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}