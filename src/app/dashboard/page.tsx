import { prisma } from '@/lib/db/prisma';
import DashboardClient from './DashboardClient';

export const instant = false;

export default async function DashboardPage() {
  const db = prisma as any;
  let contracts = [];

  try {
    const rawContracts = await db.contract.findMany({
      include: {
        buyer: true,
        seller: true,
        milestones: true,
        escrowState: true,
        agentLogs: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fully serialize all Prisma Decimal objects across contracts, milestones, and escrow states
    contracts = rawContracts.map((c: any) => ({
      ...c,
      totalAmount: c.totalAmount ? Number(c.totalAmount) : 0,
      milestones: c.milestones?.map((m: any) => ({
        ...m,
        amount: m.amount ? Number(m.amount) : 0,
      })),
      escrowState: c.escrowState ? {
        ...c.escrowState,
        amountCaptured: c.escrowState.amountCaptured ? Number(c.escrowState.amountCaptured) : 0,
        feeAmount: c.escrowState.feeAmount ? Number(c.escrowState.feeAmount) : 0,
      } : null,
    }));
  } catch (err) {
    console.error('Database connection error:', err);
  }

  return <DashboardClient contracts={contracts} />;
}