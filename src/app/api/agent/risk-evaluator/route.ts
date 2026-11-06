import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: Request) {
  try {
    const { contractId } = await request.json();
    const db = prisma as any;

    let targetContractId = contractId;
    if (!targetContractId) {
      const firstContract = await db.contract.findFirst();
      targetContractId = firstContract?.id;
    }

    if (!targetContractId) {
      return NextResponse.json({ success: false, error: 'No contract found for risk evaluation.' }, { status: 400 });
    }

    // Fetch contract details and related logs
    const contract = await db.contract.findUnique({
      where: { id: targetContractId },
      include: { milestones: true, agentLogs: true }
    });

    // Simulate heuristic AI risk analysis based on logs and milestone count
    const logCount = contract?.agentLogs?.length || 0;
    const riskScore = logCount > 5 ? 18 : 64; // Fewer logs or erratic patterns increase risk
    const riskLevel = riskScore > 50 ? 'ELEVATED_RISK' : 'HEALTHY';

    // Log telemetry
    await db.agentLog.create({
      data: {
        agentRole: 'RISK_EVALUATOR',
        action: `RISK_ASSESSMENT_${riskLevel}`,
        payload: JSON.stringify({ contractId: targetContractId, riskScore, riskLevel }),
        contract: { connect: { id: targetContractId } },
      },
    });

    return NextResponse.json({
      success: true,
      riskScore,
      riskLevel,
      recommendation: riskScore > 50 
        ? 'Warning: Low telemetry velocity detected. Recommending partial milestone escrow freeze.' 
        : 'Project velocity stable. Escrow execution proceeding normally.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}