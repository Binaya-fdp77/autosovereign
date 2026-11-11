import { NextResponse } from "next/server";
import { judge } from "@/lib/ai-judge";
import { telemetryEmitter } from "@/lib/events/emitter";

export async function POST(request: Request) {
  const { contractId, repoUrl, prNumber, commitDiff } = await request.json().catch(() => ({} as any));
  if (!commitDiff) return NextResponse.json({ success: false, error: "commitDiff required" }, { status: 400 });
  try {
    const v = await judge(`Code review of PR #${prNumber} (${repoUrl})`, commitDiff);
    telemetryEmitter.emit("telemetry", {
      type: "CODE_AUDITED",
      message: `[Auditor] ${contractId}: ${v.approved ? "PASS" : "FAIL"} (confidence ${v.confidence})`,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json({ success: true, report: v });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 503 });
  }
}