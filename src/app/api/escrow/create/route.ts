import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { paypalClient } from '@/lib/paypal/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { contractId } = body;

    if (!contractId) {
      return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 });
    }

    const db = prisma as any;
    const contract = await db.contract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    const order = await paypalClient.createOrder(
      Number(contract.totalAmount || 100).toFixed(2), 
      contract.currency || 'USD', 
      contract.id
    );

    await db.escrowState.upsert({
      where: { contractId: contract.id },
      update: { paypalOrderId: order.id, status: 'CREATED' },
      create: {
        contractId: contract.id,
        paypalOrderId: order.id,
        status: 'CREATED',
        amountCaptured: 0,
      },
    });

    const approvalUrl = order.links?.find((l: any) => l.rel === 'approve')?.href || `http://localhost:3000/dashboard?mock_success=true&contractId=${contract.id}`;

    return NextResponse.json({ success: true, approvalUrl, orderId: order.id });
  } catch (error: any) {
    console.error('Escrow create error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}