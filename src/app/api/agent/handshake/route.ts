import { NextResponse } from "next/server";
import { runBuyerAgentNegotiation } from "@/lib/agents/buyer-agent";
import { runSellerAgentNegotiation } from "@/lib/agents/seller-agent";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const projectScope = body.projectScope || body.proposalTerms || "Standard Autonomous Micro-Escrow";
    const maxBudget = body.maxBudget || body.targetPrice || 1250.00;
    const contractId = body.contractId || "cnt_" + Math.floor(Math.random() * 90000 + 10000);

    // Run dual-agent consensus
    const buyerResult = await runBuyerAgentNegotiation(contractId, projectScope, maxBudget);
    const sellerResult = await runSellerAgentNegotiation(contractId, projectScope, maxBudget);

    const agreedPrice = Math.min(buyerResult.agreedPrice, sellerResult.acceptedPrice);

    return NextResponse.json({
      success: true,
      contractId,
      agreedPrice,
      buyerStatus: buyerResult.status,
      sellerStatus: sellerResult.status,
      summary: buyerResult.summary,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
