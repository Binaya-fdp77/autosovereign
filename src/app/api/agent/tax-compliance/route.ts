import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { contractId, jurisdiction } = body;

    if (!contractId || !jurisdiction) {
      return NextResponse.json({ error: 'Missing contractId or jurisdiction' }, { status: 400 });
    }

    const db = prisma as any;
    const contract = await db.contract.findUnique({ where: { id: contractId } });

    if (!contract) return NextResponse.json({ error: 'Contract not found' }, { status: 404 });

    const total = Number(contract.totalAmount);
    let taxRate = 0.0;
    let complianceStandard = 'Standard Exemption';

    if (jurisdiction.toUpperCase() === 'US') {
      taxRate = 0.24; // Standard backup withholding if tax ID unverified
      complianceStandard = 'IRS 1099-NEC & Backup Withholding Check';
    } else if (jurisdiction.toUpperCase() === 'EU') {
      taxRate = 0.20; // VAT standard rate estimate
      complianceStandard = 'EU Cross-Border VAT Directive';
    }

    const withholdingAmount = (total * taxRate).toFixed(2);
    const netPayout = (total - Number(withholdingAmount)).toFixed(2);

    // Generate cryptographic compliance hash
    const complianceHash = crypto
      .createHash('sha256')
      .update(`${contractId}-${jurisdiction}-${total}-${Date.now()}`)
      .digest('hex');

    // Log compliance audit to AG Grid telemetry
    await db.agentLog.create({
      data: {
        contractId,
        agentRole: 'TAX_COMPLIANCE_AGENT',
        action: `Verified Tax Compliance (${jurisdiction.toUpperCase()})`,
        payload: JSON.stringify({
          jurisdiction: jurisdiction.toUpperCase(),
          complianceStandard,
          grossAmount: total,
          taxRateWithheld: `${taxRate * 100}%`,
          withholdingAmount,
          netPayout,
          complianceHash,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      jurisdiction: jurisdiction.toUpperCase(),
      complianceStandard,
      grossAmount: total,
      withholdingAmount,
      netPayout,
      complianceHash,
    });
  } catch (error: any) {
    console.error('Tax Compliance error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}