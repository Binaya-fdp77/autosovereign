import { NextResponse } from "next/server";
import { runBuyerAgentNegotiation } from "@/lib/agents/buyer-agent";

export async function POST(req: Request) {
  try {
    const { contractId, proposalTerms, budgetMax } = await req.json();

    if (!contractId || !proposalTerms || !budgetMax) {
      return NextResponse.json({ error: "Missing required negotiation parameters" }, { status: 400 });
    }

    const negotiationResult = await runBuyerAgentNegotiation(contractId, proposalTerms, budgetMax);

    return NextResponse.json({
      success: true,
      contractId,
      negotiation: negotiationResult,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
