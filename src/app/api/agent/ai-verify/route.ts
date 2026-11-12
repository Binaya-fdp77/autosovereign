import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { judge } from "@/lib/ai-judge";

export async function POST(request: Request) {
  const { contractId, milestoneId, evidence } = await request.json().catch(() => ({} as any));
  if (!contractId || !milestoneId) return NextResponse.json({ error: "contractId and milestoneId required" }, { status: 400 });
  const m = await prisma.milestone.findFirst({ where: { id: milestoneId, contractId } });
  if (!m) return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
  try {
    const v = await judge(`${m.title}. Acceptance criteria: ${m.deliverable ?? ""}`, evidence ?? "");
    await prisma.milestone.update({ where: { id: m.id }, data: { status: v.approved ? "VERIFIED" : "SUBMITTED" } });
    await prisma.agentLog.create({
      data: { contractId, agentRole: "AI_VERIFIER", agentType: "AI_VERIFIER", action: `${v.approved ? "APPROVED" : "REJECTED"}: ${m.title}`, reasoning: v.reasons.join(" | "), payload: JSON.stringify(v) },
    });
    return NextResponse.json({ success: true, approved: v.approved, verdict: v });
  } catch (e: any) {
    return NextResponse.json({ error: `AI verification unavailable: ${e.message}` }, { status: 503 });
  }
}
