import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url, 'http://localhost');
    const contractId = url.searchParams.get('contractId');
    const db = prisma as any;

    const logs = contractId
      ? await db.agentLog.findMany({ where: { contractId }, orderBy: { createdAt: 'desc' } })
      : await db.agentLog.findMany({ orderBy: { createdAt: 'desc' }, take: 10 });

    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}