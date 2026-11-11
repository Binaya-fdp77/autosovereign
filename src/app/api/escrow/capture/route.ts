import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { paypalRequest } from "@/lib/paypal";
import { telemetryEmitter } from "@/lib/events/emitter";

export async function POST(request: Request) {
  const { contractId, simulate } = await request.json().catch(() => ({} as any));
  const escrow = contractId ? await prisma.escrowState.findUnique({ where: { contractId } }) : null;
  if (!escrow) return NextResponse.json({ error: "No escrow order for contract" }, { status: 404 });
  if (escrow.status === "COMPLETED") return NextResponse.json({ success: true, duplicate: true });

  try {
    const cap = await paypalRequest<any>(`/v2/checkout/orders/${escrow.paypalOrderId}/capture`, {
      method: "POST",
      requestId: `cap-${escrow.paypalOrderId}`,
      mock: simulate === "decline" ? "INSTRUMENT_DECLINED" : undefined,
      body: {},
    });
    const c = cap.purchase_units?.[0]?.payments?.captures?.[0];
    if (c?.status === "COMPLETED") {
      await prisma.escrowState.update({ where: { contractId }, data: { status: "COMPLETED", paypalCaptureId: c.id } });
      await prisma.contract.update({ where: { id: contractId }, data: { status: "LOCKED_IN_ESCROW" } });
      await prisma.milestone.updateMany({ where: { contractId, status: "PENDING" }, data: { status: "FUNDED" } });
    }
    telemetryEmitter.emit("telemetry", {
      type: "ESCROW_FUNDED",
      message: `[Escrow] Capture ${c?.id} ${c?.status}`,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json({ success: true, captureId: c?.id, status: c?.status });
  } catch (e: any) {
    const issue = e.details?.details?.[0]?.issue || e.message;
    return NextResponse.json({ success: false, declined: issue === "INSTRUMENT_DECLINED", issue }, { status: 402 });
  }
}