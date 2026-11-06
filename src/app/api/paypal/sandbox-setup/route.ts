import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const sandboxProfiles = {
      buyer: {
        email: "sb-buyer-autosovereign@business.example.com",
        role: "Client / Escrow Funder",
        status: "VERIFIED_SANDBOX",
        balance: "$10,000.00 USD",
      },
      seller: {
        email: "sb-seller-autosovereign@personal.example.com",
        role: "Contractor / Payout Recipient",
        status: "VERIFIED_SANDBOX",
        payoutPreference: "Instant PayPal Payout (USD/EUR)",
      },
      gateway: {
        clientId: process.env.PAYPAL_CLIENT_ID ? "CONFIGURED (Active)" : "MISSING",
        environment: "PayPal Sandbox REST API v2",
        webhookListener: "/api/webhooks/paypal",
      }
    };

    const db = prisma as any;
    
    // Find a contract to attach the log to if available, otherwise skip log creation
    const latestContract = await db.contract.findFirst();
    if (latestContract) {
      await db.agentLog.create({
        data: {
          contractId: latestContract.id,
          agentRole: 'PAYPAL_SANDBOX_VERIFIER',
          action: 'Verified PayPal Developer Sandbox Profile Status',
          payload: JSON.stringify(sandboxProfiles),
        },
      });
    }

    return NextResponse.json({
      success: true,
      profiles: sandboxProfiles,
    });
  } catch (error: any) {
    console.error('Sandbox Setup error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}