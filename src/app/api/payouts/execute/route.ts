import { NextRequest, NextResponse } from 'next/server';
import 'server-only';
import { prisma } from '@/lib/db/prisma';
import { paypalClient } from '@/lib/paypal/client';
import { parsePayPalError } from '@/lib/paypal/error-parser';

export async function POST(req: NextRequest) {
  try {
    const { milestoneId } = await req.json();

    if (!milestoneId) {
      return NextResponse.json({ error: 'Milestone ID required' }, { status: 400 });
    }

    // Atomic release check
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        contract: {
          include: { seller: true, escrowState: true },
        },
      },
    });

    if (!milestone || milestone.status !== 'VERIFIED') {
      return NextResponse.json({ error: 'Milestone not in VERIFIED status for payout.' }, { status: 400 });
    }

    const totalAmount = Number(milestone.amount);
    const feePct = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '0.025');
    const feeAmount = parseFloat((totalAmount * feePct).toFixed(2));
    const freelancerAmount = parseFloat((totalAmount - feeAmount).toFixed(2));

    const payoutPayload = {
      sender_batch_header: {
        sender_batch_id: `BATCH-${milestone.id}-${Date.now()}`,
        email_subject: 'AutoSovereign Escrow Release: Payment Received!',
        email_message: `Funds for milestone "${milestone.title}" have been verified and released to your wallet.`,
      },
      items: [
        {
          recipient_type: 'EMAIL',
          amount: {
            value: freelancerAmount.toFixed(2),
            currency: milestone.contract.currency,
          },
          note: `Milestone payment for: ${milestone.title}`,
          sender_item_id: `PAYOUT-FL-${milestone.id}`,
          receiver: milestone.contract.seller.paypalEmail,
        },
        {
          recipient_type: 'EMAIL',
          amount: {
            value: feeAmount.toFixed(2),
            currency: milestone.contract.currency,
          },
          note: `Platform service fee for milestone: ${milestone.title}`,
          sender_item_id: `PAYOUT-FEE-${milestone.id}`,
          receiver: process.env.PLATFORM_PAYPAL_ACCOUNT_EMAIL,
        },
      ],
    };

    const payoutResult = await paypalClient.request<{ batch_header: { payout_batch_id: string } }>(
      '/v1/payments/payouts',
      {
        method: 'POST',
        body: payoutPayload,
      }
    );

    // Update DB
    await prisma.$transaction([
      prisma.milestone.update({
        where: { id: milestone.id },
        data: { status: 'PAID' },
      }),
      prisma.escrowState.update({
        where: { contractId: milestone.contractId },
        data: {
          feeAmount: { increment: feeAmount },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      batchId: payoutResult.batch_header.payout_batch_id,
      freelancerAmount,
      feeAmount,
    });
  } catch (error) {
    const parsed = parsePayPalError(error);
    return NextResponse.json({ error: parsed.issue, message: parsed.message }, { status: parsed.statusCode });
  }
}
