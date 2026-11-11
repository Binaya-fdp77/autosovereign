
import { NextResponse } from "next/server";
import { getPayPalAccessToken } from "@/lib/paypal";

const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";

export async function POST(request: Request) {
  try {
    const { payoutAmount, contractId, recipientEmail } = await request.json();

    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${PAYPAL_API_BASE}/v1/payments/payouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        sender_batch_header: {
          sender_batch_id: `payout_${contractId}_${Date.now()}`,
          email_subject: "AutoSovereign milestone payout released",
        },
        items: [
          {
            recipient_type: "EMAIL",
            amount: {
              value: payoutAmount.toFixed(2),
              currency: "USD",
            },
            receiver: recipientEmail || "freelancer@sandbox.paypal.com",
            note: `AutoSovereign milestone payout for contract ${contractId}`,
          },
        ],
      }),
    });

    const payoutData = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: payoutData }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      batchId: payoutData.batch_header?.payout_batch_id,
      status: payoutData.batch_header?.batch_status,
    });

  } catch (err: any) {
    console.error("Payout Release Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

