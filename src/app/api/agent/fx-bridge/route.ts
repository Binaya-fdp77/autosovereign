import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { contractId, targetCurrency } = body;

    if (!contractId || !targetCurrency) {
      return NextResponse.json({ error: 'Missing contractId or targetCurrency' }, { status: 400 });
    }

    const db = prisma as any;
    const contract = await db.contract.findUnique({ where: { id: contractId } });

    if (!contract) return NextResponse.json({ error: 'Contract not found' }, { status: 404 });

    // Mock exchange rates relative to USD
    const rates: Record<string, number> = { USD: 1.0, EUR: 0.92, GBP: 0.79, JPY: 155.0, AUD: 1.52 };
    const rate = rates[targetCurrency.toUpperCase()] || 1.0;
    const convertedAmount = (Number(contract.totalAmount) * rate).toFixed(2);

    // Log telemetry
    await db.agentLog.create({
      data: {
        contractId,
        agentRole: 'FOREX_CONVERSION_AGENT',
        action: `Calculated FX bridge to ${targetCurrency.toUpperCase()}`,
        payload: JSON.stringify({
          originalAmountUSD: Number(contract.totalAmount),
          targetCurrency: targetCurrency.toUpperCase(),
          exchangeRate: rate,
          convertedAmount,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      originalAmount: Number(contract.totalAmount),
      targetCurrency: targetCurrency.toUpperCase(),
      exchangeRate: rate,
      convertedAmount,
    });
  } catch (error: any) {
    console.error('FX Bridge error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}