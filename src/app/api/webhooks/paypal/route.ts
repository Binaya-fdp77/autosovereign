import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { paypalRequest } from "@/lib/paypal";

export const runtime = "nodejs";

async function verify(h: Headers, event: unknown) {
  const r = await paypalRequest<{ verification_status: string }>("/v1/notifications/verify-webhook-signature", {
    method: "POST",
    body: {
      auth_algo: h.get("paypal-auth-algo"),
      cert_url: h.get("paypal-cert-url"),
      transmission_id: h.get("paypal-transmission-id"),
      transmission_sig: h.get("paypal-transmission-sig"),
      transmission_time: h.get("paypal-transmission-time"),
      webhook_id: process.env.PAYPAL_WEBHOOK_ID,
      webhook_event: event,
    },
  });
  return r.verification_status === "SUCCESS";
}

export async function POST(request: Request) {
  let event: any;
  try { event = JSON.parse(await request.text()); }
  catch { return NextResponse.json({ error: "invalid json" }, { status: 400 }); }

  if (!request.headers.get("paypal-transmission-sig"))
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  try {
    if (!(await verify(request.headers, event)))
      return NextResponse.json({ error: "bad signature" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "verification unavailable" }, { status: 500 });
  }

  const key = `wh_${event.id}`;
  try {
    await prisma.idempotencyKey.create({
      data: { key, requestHash: String(event.event_type), expiresAt: new Date(Date.now() + 7 * 864e5) },
    });
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ received: true, duplicate: true });
    return NextResponse.json({ error: "store failed" }, { status: 500 });
  }

  try {
    const type: string = event.event_type;
    const r = event.resource ?? {};
    const up = r.links?.find((l: any) => l.rel === "up")?.href as string | undefined;
    const orderId = r.supplementary_data?.related_ids?.order_id ?? (type.startsWith("CHECKOUT.ORDER") ? r.id : undefined);
    const captureId = type.startsWith("PAYMENT.CAPTURE")
      ? (/REFUNDED|REVERSED/.test(type) ? up?.split("/").pop() ?? r.id : r.id)
      : undefined;
    const batchId = r.payout_batch_id as string | undefined;

    const or: any[] = [];
    if (orderId) or.push({ paypalOrderId: orderId });
    if (captureId) or.push({ paypalCaptureId: captureId });
    if (batchId) or.push({ paypalPayoutBatchId: batchId });
    const escrow = or.length ? await prisma.escrowState.findFirst({ where: { OR: or } }) : null;
    if (!escrow) return NextResponse.json({ received: true, matched: false });

    const cid = escrow.contractId;
    switch (type) {
      case "CHECKOUT.ORDER.APPROVED":
        if (escrow.status === "CREATED")
          await prisma.escrowState.update({ where: { contractId: cid }, data: { status: "APPROVED" } });
        break;
      case "PAYMENT.CAPTURE.COMPLETED":
        await prisma.escrowState.update({ where: { contractId: cid }, data: { status: "COMPLETED", paypalCaptureId: r.id } });
        await prisma.contract.update({ where: { id: cid }, data: { status: "LOCKED_IN_ESCROW" } });
        await prisma.milestone.updateMany({ where: { contractId: cid, status: "PENDING" }, data: { status: "FUNDED" } });
        break;
      case "PAYMENT.CAPTURE.DENIED":
      case "PAYMENT.CAPTURE.DECLINED":
        await prisma.escrowState.update({ where: { contractId: cid }, data: { status: "VOIDED" } });
        await prisma.contract.update({ where: { id: cid }, data: { status: "CANCELLED" } });
        break;
      case "PAYMENT.CAPTURE.REFUNDED":
      case "PAYMENT.CAPTURE.REVERSED":
        await prisma.escrowState.update({ where: { contractId: cid }, data: { status: "VOIDED" } });
        await prisma.milestone.updateMany({ where: { contractId: cid }, data: { status: "REFUNDED" } });
        await prisma.contract.update({ where: { id: cid }, data: { status: "CANCELLED" } });
        break;
      case "PAYMENT.PAYOUTS-ITEM.SUCCEEDED":
        await prisma.milestone.updateMany({ where: { contractId: cid }, data: { status: "RELEASED" } });
        await prisma.contract.update({ where: { id: cid }, data: { status: "COMPLETED" } });
        break;
      case "PAYMENT.PAYOUTS-ITEM.FAILED":
      case "PAYMENT.PAYOUTS-ITEM.BLOCKED":
      case "PAYMENT.PAYOUTS-ITEM.DENIED":
      case "PAYMENT.PAYOUTS-ITEM.RETURNED":
        await prisma.contract.update({ where: { id: cid }, data: { status: "DISPUTED" } });
        break;
    }
    await prisma.agentLog.create({
      data: { contractId: cid, agentRole: "PAYPAL_WEBHOOK", agentType: "PAYPAL_WEBHOOK", action: type, payload: JSON.stringify({ eventId: event.id }) },
    });
    return NextResponse.json({ received: true });
  } catch {
    await prisma.idempotencyKey.delete({ where: { key } }).catch(() => {});
    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }
}