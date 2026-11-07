import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, budget } = body;
    const db = prisma as any;

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Project description prompt is required.' }, { status: 400 });
    }

    // Fetch default buyer and seller for automatic assignment
    let buyer = await db.user.findFirst({ where: { role: 'BUYER' } });
    let seller = await db.user.findFirst({ where: { role: 'CONTRACTOR' } });

    if (!buyer || !seller) {
      buyer = await db.user.create({ data: { name: 'Alice Buyer', email: 'buyer@autosovereign.test', paypalEmail: 'buyer-paypal@autosovereign.test', role: 'BUYER' } });
      seller = await db.user.create({ data: { name: 'Bob Seller', email: 'seller@autosovereign.test', paypalEmail: 'seller-paypal@autosovereign.test', role: 'CONTRACTOR' } });
    }

    const totalAmount = budget ? parseFloat(budget) : 1000.0;

    // Create Contract with LOCKED_IN_ESCROW status automatically
    const contract = await db.contract.create({
      data: {
        title: prompt.length > 40 ? prompt.slice(0, 37) + '...' : prompt,
        description: prompt,
        totalAmount,
        currency: 'USD',
        status: 'LOCKED_IN_ESCROW',
        buyerId: buyer.id,
        sellerId: seller.id,
        milestones: {
          create: [
            { title: 'Milestone 1: Core Architecture & Setup', amount: totalAmount * 0.5, deliverable: 'Repository setup and initial schemas', status: 'PENDING' },
            { title: 'Milestone 2: Final Delivery & Verification', amount: totalAmount * 0.5, deliverable: 'Fully tested application build', status: 'PENDING' }
          ]
        }
      },
      include: { milestones: true }
    });

    // Record Swarm Telemetry Log
    await db.agentLog.create({
      data: {
        agentRole: 'AI_ESCROW_ARCHITECT',
        action: 'AUTO_ARCHITECT_AND_LOCK_ESCROW',
        payload: JSON.stringify({ contractId: contract.id, totalAmount, status: 'LOCKED_IN_ESCROW' }),
        contractId: contract.id,
      },
    });

    return NextResponse.json({ success: true, contract });
  } catch (error: any) {
    console.error('Architect error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}