import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { PAYPAL_BASE, getAccessToken } from "../../../../lib/paypal";

export async function POST() {
  try {
    const amount = "10.00"; // TODO: calculate on the server, never trust the browser
    const token = await getAccessToken();

    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{ amount: { currency_code: "USD", value: amount } }],
      }),
    });
    const order = await res.json();

    if (!order.id) {
      console.error("PayPal create order failed:", order);
      return NextResponse.json(order, { status: 500 });
    }

    await prisma.order.create({
      data: { paypalId: order.id, amount, status: "PENDING" },
    });

    return NextResponse.json({ id: order.id });
  } catch (err) {
    console.error("create-order error:", err);
    return NextResponse.json({ error: "create-order failed" }, { status: 500 });
  }
}