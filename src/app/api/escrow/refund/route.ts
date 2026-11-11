import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { paypalRequest } from "@/lib/paypal";

export async function POST(request: Request) {
  const { contractId } = await request.json().catch(() => ({} as any));
  const escrow = contractId ? await prisma.escrowState.findUnique({ where: { contractId } }) : null;
  if (!escrow?.paypalCaptureId) return NextResponse.json({ error: "Nothing captured to refund" }, { status: 404 });
  if (escrow.paypalPayoutBatchId) return NextResponse.json({ error: "Already paid out" }, { status: 409 });
  try {
    const r = await paypalRequest<any>(`/v2/payments/captures/${escrow.paypalCaptureId}/refund`, {
      method: "POST", requestId: `refund-${escrow.paypalCaptureId}`, body: { note_to_payer: "Escrow refund" },
    });
    await prisma.escrowState.update({ where: { contractId }, data: { status: "VOIDED" } });
    await prisma.milestone.updateMany({ where: { contractId }, data: { status: "REFUNDED" } });
    await prisma.contract.update({ where: { id: contractId }, data: { status: "CANCELLED" } });
    return NextResponse.json({ success: true, refundId: r.id, status: r.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, details: e.details }, { status: e.status || 500 });
  }
}