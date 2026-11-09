import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { contractId, gitCommitSha } = await req.json();

    if (!contractId) {
      return NextResponse.json({ success: false, error: 'Contract ID is required' }, { status: 400 });
    }

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: { milestones: true, agentLogs: true }
    });

    if (!contract) {
      return NextResponse.json({ success: false, error: 'Contract not found' }, { status: 404 });
    }

    // Mock/Extract PayPal Batch ID & Commit SHA
    const commitSha = gitCommitSha || 'a1b2c3d4e5f67890abcdef1234567890abcdef12';
    const paypalBatchId = `PAYPAL-PAYOUT-${contract.id.slice(0, 8).toUpperCase()}`;
    const timestamp = new Date().toISOString();

    // Generate Cryptographic Proof (SHA-256 Hash)
    const rawPayload = `${contract.id}:${commitSha}:${paypalBatchId}:${contract.totalAmount}:${timestamp}`;
    const cryptographicSignature = crypto.createHash('sha256').update(rawPayload).digest('hex');

    const certificate = {
      certificateId: `CERT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      contractId: contract.id,
      title: contract.title,
      status: contract.status,
      totalAmount: contract.totalAmount,
      currency: contract.currency,
      gitCommitSha: commitSha,
      paypalBatchId,
      timestamp,
      cryptographicSignature,
      verificationUrl: `https://autosovereign.verify/cert/${cryptographicSignature.slice(0, 16)}`
    };

    // Save event to agent log
    await prisma.agentLog.create({
      data: {
        agentRole: 'SETTLEMENT_CERTIFICATE_ISSUER',
        action: 'ISSUED_CRYPTOGRAPHIC_CERTIFICATE',
        payload: JSON.stringify(certificate),
        contractId: contract.id
      }
    });

    return NextResponse.json({ success: true, certificate });
  } catch (error: any) {
    console.error('Certificate API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}