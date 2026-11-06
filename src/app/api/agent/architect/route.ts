import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: Request) {
  try {
    const { prompt, budget, clientId, contractorId } = await request.json();
    const db = prisma as any;

    // Get default client/contractor if missing
    let clientUser = clientId ? await db.user.findUnique({ where: { id: clientId } }) : null;
    if (!clientUser) clientUser = await db.user.findFirst({ where: { role: 'CLIENT' } });
    if (!clientUser) clientUser = await db.user.findFirst();

    let contractorUser = contractorId ? await db.user.findUnique({ where: { id: contractorId } }) : null;
    if (!contractorUser) contractorUser = await db.user.findFirst({ where: { role: 'CONTRACTOR' } });
    if (!contractorUser) contractorUser = clientUser;

    // Create Contract with valid ContractStatus enum value
    const contract = await db.contract.create({
      data: {
        title: prompt.slice(0, 40) || 'AI Managed Escrow Contract',
        description: prompt,
        amount: parseFloat(budget) || 1000.0,
        currency: 'USD',
        status: 'LOCKED_IN_ESCROW', // Valid enum value
        clientId: clientUser.id,
        contractorId: contractorUser.id,
      },
    });

    // Create Initial Milestone
    const milestone = await db.milestone.create({
      data: {
        title: 'Core Deliverables Implementation',
        description: 'Complete baseline architecture and integration requirements.',
        amount: parseFloat(budget) || 1000.0,
        status: 'PENDING',
        contractId: contract.id,
      },
    });

    // Log telemetry
    await db.agentLog.create({
      data: {
        agentRole: 'ARCHITECT',
        action: 'CREATE_CONTRACT',
        payload: JSON.stringify({ contractId: contract.id, milestoneId: milestone.id, budget }),
        contract: { connect: { id: contract.id } },
      },
    });

    return NextResponse.json({ success: true, contract, milestone });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}