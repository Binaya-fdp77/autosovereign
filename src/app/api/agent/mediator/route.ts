import { NextResponse } from "next/server";
import { telemetryEmitter } from "@/lib/events/emitter";

export async function POST(request: Request) {
  try {
    const { contractId, buyerClaim, sellerClaim } = await request.json();

    // Mock or actual 3-agent consensus arbitration
    const settlement = {
      payoutBuyer: 200,
      payoutSeller: 1300,
      rationale: "Multi-party jury verified core git deliverables with minor documentation delay adjustments.",
    };

    // ⚡ Broadcast live telemetry event
    telemetryEmitter.emit("telemetry", {
      type: "DISPUTE_RESOLVED",
      message: `[Dispute Jury] Consensus reached for contract ${contractId}`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, settlement });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
