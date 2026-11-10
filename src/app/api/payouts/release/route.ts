import { NextResponse } from "next/server";
import { payPalClient } from "@/lib/paypal/client";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { contractId, freelancerEmail } = await req.json();

    if (!contractId || !freelancerEmail) {
      return NextResponse.json({ error: "Missing contractId or freelancerEmail parameters" }, { status: 400 });
    }

    // Fetch escrow state from SQLite
    const escrow = await prisma.escrowState.findUnique({
      where: { contractId },
    });

    if (!escrow || escrow.status !== "COMPLETED") {
      return NextResponse.json({ error: "Escrow not found or not funded/completed yet." }, { status: 400 });
    }

    const payoutAmount = Number(escrow.freelancerAmount);

    // Trigger PayPal Payouts v1 API
    const payoutResponse = await payPalClient.createPayout(
      freelancerEmail,
      payoutAmount,
      "USD",
      \AutoSovereign milestone payout for contract \\
    );

    // Update SQLite EscrowState with batch payout ID
    await prisma.escrowState.update({
      where: { id: escrow.id },
      data: {
        paypalPayoutBatchId: payoutResponse.batch_header?.payout_batch_id,
      },
    });

    // Update Contract and Milestones to COMPLETED / RELEASED
    await prisma.contract.update({
      where: { id: contractId },
      data: { status: "COMPLETED" },
    });

    await prisma.milestone.updateMany({
      where: { contractId },
      data: { status: "RELEASED" },
    });

    return NextResponse.json({
      success: true,
      contractId,
      payoutBatchId: payoutResponse.batch_header?.payout_batch_id,
      batchStatus: payoutResponse.batch_header?.batch_status,
      amountDisbursed: payoutAmount,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
