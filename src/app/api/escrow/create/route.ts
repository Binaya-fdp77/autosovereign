import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { paypalRequest } from "@/lib/paypal";
import { telemetryEmitter } from "@/lib/events/emitter";

const cents = (d: unknown) => Math.round(Number(d) * 100);
const fmt = (c: number) => (c / 100).toFixed(2);

export async function POST(request: Request) {
  try {
    const { contractId } = await request.json();
    const contract = await prisma.contract.findUnique({ where: { id: contractId }, include: { escrowState: true } });
    if (!contract) return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    if (contract.escrowState?.status === "COMPLETED")
      return NextResponse.json({ error: "Already funded" }, { status: 409 });

    const total = cents(contract.totalAmount);
    if (!(total > 0)) return NextResponse.json({ error: "Invalid contract amount" }, { status: 422 });
    const fee = Math.round(total * 0.05);

    const order = await paypalRequest<any>("/v2/checkout/orders", {
      method: "POST",
      requestId: `order-${contract.id}-${Date.now()}`,
      body: {
        intent: "CAPTURE",
        purchase_units: [{
          reference_id: contract.id,
          custom_id: contract.id,
          description: contract.title.slice(0, 120),
          amount: { currency_code: contract.currency, value: fmt(total) },
        }],
      },
    });

    await prisma.escrowState.upsert({
      where: { contractId: contract.id },
      create: {
        contractId: contract.id, paypalOrderId: order.id, status: "CREATED",
        amountLocked: fmt(total), platformFeeAmount: fmt(fee), freelancerAmount: fmt(total - fee),
      },
      update: { paypalOrderId: order.id, status: "CREATED" },
    });

    telemetryEmitter.emit("telemetry", {
      type: "ESCROW_CREATED",
      message: `[Escrow] Order ${order.id} created for $${fmt(total)}`,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json({ success: true, paypalOrderId: order.id, status: order.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, details: e.details }, { status: e.status || 500 });
  }
}