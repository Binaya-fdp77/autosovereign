import { NextResponse } from "next/server";
import { paypalClient } from "@/lib/paypal/client";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { contractId, title, amount } = body;

    // Create PayPal v2 Order
    const paypalOrder = await paypalClient.createOrder(amount || 1250.00);

    return NextResponse.json({
      success: true,
      contractId: contractId || "cnt_101",
      paypalOrderId: paypalOrder.paypalOrderId,
      status: "LOCKED_IN_ESCROW",
      approveUrl: paypalOrder.approveUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
