import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { PAYPAL_BASE, getAccessToken } from "../../../../lib/paypal";

export async function POST(req: Request) {
  try {
    const { orderID } = await req.json();
    const token = await getAccessToken();

    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();

    if (data.status === "COMPLETED") {
      await prisma.order.updateMany({
        where: { paypalId: orderID },
        data: { status: "PAID" },
      });
    } else {
      console.error("Capture not completed:", data);
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("capture-order error:", err);
    return NextResponse.json({ error: "capture-order failed" }, { status: 500 });
  }
}