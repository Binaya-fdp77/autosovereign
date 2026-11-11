import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { paypalRequest } from "@/lib/paypal";
import { EscrowDeterministicGuard } from "@/lib/escrowGuard";

export async function POST(req: Request) {
  const { contractId } = await req.json().catch(() => ({} as any));
  if (!contractId) return NextResponse.json({ success: false, error: "contractId required" }, { status: 400 });

  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: { milestones: true, escrowState: true, seller: true },
  });
  if (!contract?.escrowState) return NextResponse.json({ success: false, error: "No escrow" }, { status: 404 });
  const escrow = contract.escrowState;
  if (escrow.paypalPayoutBatchId)
    return NextResponse.json({ success: true, duplicate: true, batchId: escrow.paypalPayoutBatchId });

  const guard = EscrowDeterministicGuard.validatePayoutEligibility({
    isCodeAudited: contract.milestones.length > 0 && contract.milestones.every((m) => m.status === "VERIFIED"),
    isConsensusReached: escrow.status === "COMPLETED",
    isBudgetValid: Number(escrow.freelancerAmount) > 0,
    hasBuyerApprovedOrJuryWon: contract.status !== "DISPUTED",
  });
  if (!guard.eligible) return NextResponse.json({ success: false, error: guard.reason }, { status: 422 });

  const receiver = contract.seller.paypalReceiverEmail || contract.seller.email;
  const batchKey = `AS-${contract.id}`;
  try {
    const res = await paypalRequest<any>("/v1/payments/payouts", {
      method: "POST",
      requestId: batchKey,
      body: {
        sender_batch_header: { sender_batch_id: batchKey, email_subject: "AutoSovereign payout released" },
        items: [{
          recipient_type: "EMAIL",
          receiver,
          amount: { value: Number(escrow.freelancerAmount).toFixed(2), currency: contract.currency },
          sender_item_id: `${batchKey}-1`,
          note: `Contract ${contract.title}`.slice(0, 160),
        }],
      },
    });
    const batchId = res.batch_header?.payout_batch_id as string;
    await prisma.escrowState.update({ where: { contractId }, data: { paypalPayoutBatchId: batchId } });
    await prisma.milestone.updateMany({ where: { contractId }, data: { status: "RELEASED" } });
    await prisma.contract.update({ where: { id: contractId }, data: { status: "COMPLETED" } });
    await prisma.agentLog.create({
      data: { contractId, agentRole: "PAYOUT", agentType: "PAYOUT", action: "PAYOUT_SENT", payload: JSON.stringify({ batchId, guard: guard.reason }) },
    });
    return NextResponse.json({ success: true, batchId, guardVerification: guard.reason });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message, details: e.details }, { status: e.status || 500 });
  }
}