import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { PAYPAL_BASE, getAccessToken } from "../../../../lib/paypal";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const event = JSON.parse(rawBody);

  const token = await getAccessToken();
  const verify = await fetch(`${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_algo: req.headers.get("paypal-auth-algo"),
      cert_url: req.headers.get("paypal-cert-url"),
      transmission_id: req.headers.get("paypal-transmission-id"),
      transmission_sig: req.headers.get("paypal-transmission-sig"),
      transmission_time: req.headers.get("paypal-transmission-time"),
      webhook_id: process.env.PAYPAL_WEBHOOK_ID,
      webhook_event: event,
    }),
  });
  const result = await verify.json();

  if (result.verification_status !== "SUCCESS") {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const orderId = event.resource?.supplementary_data?.related_ids?.order_id;

  switch (event.event_type) {
    case "PAYMENT.CAPTURE.COMPLETED":
      if (orderId) {
        await prisma.order.updateMany({ where: { paypalId: orderId }, data: { status: "PAID" } });
      }
      break;
    case "PAYMENT.CAPTURE.DENIED":
      if (orderId) {
        await prisma.order.updateMany({ where: { paypalId: orderId }, data: { status: "FAILED" } });
      }
      break;
    case "PAYMENT.CAPTURE.REFUNDED":
      console.log("Refunded:", event.resource?.id);
      break;
  }

  return NextResponse.json({ received: true });
}