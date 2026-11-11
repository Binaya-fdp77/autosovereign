import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json({ error: "Deprecated. Use /api/agent/ai-verify.", }, { status: 410 });
}