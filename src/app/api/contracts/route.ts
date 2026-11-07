import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const db = prisma as any;
    const contracts = await db.contract.findMany({
      include: { milestones: true, buyer: true, seller: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, contracts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}