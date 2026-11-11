import { prisma } from "@/lib/db/prisma";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const contracts = await prisma.contract.findMany({
    include: { milestones: true, escrowState: true, agentLogs: true },
    orderBy: { createdAt: "desc" },
  });
  return <DashboardClient contracts={JSON.parse(JSON.stringify(contracts))} />;
}