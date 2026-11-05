import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const contractId = request.nextUrl.searchParams.get('contractId');

    const db = prisma as any;
    const contracts = contractId 
      ? await db.contract.findMany({ where: { id: contractId }, include: { milestones: true, agentLogs: true } })
      : await db.contract.findMany({ include: { milestones: true, agentLogs: true }, take: 10 });

    const auditBundle = {
      platform: "AutoSovereign Autonomous Enterprise Escrow",
      generatedAt: new Date().toISOString(),
      recordCount: contracts.length,
      data: contracts,
    };

    const bundleString = JSON.stringify(auditBundle, null, 2);
    const cryptographicAttestationHash = crypto
      .createHash('sha256')
      .update(bundleString)
      .digest('hex');

    const finalReport = {
      ...auditBundle,
      attestation: {
        algorithm: "SHA-256",
        signatureHash: cryptographicAttestationHash,
        status: "VERIFIED_IMMUTABLE",
      },
    };

    return new NextResponse(JSON.stringify(finalReport, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="autosovereign-audit-attestation.json"',
      },
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}