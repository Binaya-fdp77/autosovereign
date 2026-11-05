import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const contractId = request.nextUrl.searchParams.get('contractId');
    const db = prisma as any;

    // Fetch latest agent telemetry for the contract
    const logs = contractId 
      ? await db.agentLog.findMany({ where: { contractId }, orderBy: { createdAt: 'desc' }, take: 15 })
      : await db.agentLog.findMany({ orderBy: { createdAt: 'desc' }, take: 15 });

    const swarmNodes = [
      { id: 'node-1', name: 'Escrow Architect Agent', status: 'ACTIVE', load: '14ms', role: 'GPT-4o Orchestration' },
      { id: 'node-2', name: 'Risk & Compliance Agent', status: 'VERIFIED', load: '8ms', role: 'IRS / VAT Withholding' },
      { id: 'node-3', name: 'Forex Liquidity Bridge', status: 'SYNCED', load: '22ms', role: 'Multi-Currency Payout' },
      { id: 'node-4', name: 'PayPal API v2 Settlement', status: 'STANDBY', load: '5ms', role: 'Automated Fund Release' },
    ];

    return NextResponse.json({
      success: true,
      swarmStatus: 'FULLY_AUTONOMOUS',
      activeNodes: swarmNodes,
      recentTelemetry: logs,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Swarm stream error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}