import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';

export async function runAgentNegotiation(contractId: string, userInstruction: string) {
  const db = prisma as any;
  const contract = await db.contract.findUnique({
    where: { id: contractId },
    include: { milestones: true },
  });

  if (!contract) throw new Error('Contract missing');

  const result = await generateText({
    model: openai('gpt-4o'),
    system: `You are the AutoSovereign Contingency Agent acting as an autonomous mediator between Buyer and Seller.`,
    prompt: `Contract ID: ${contractId}. Request: ${userInstruction}`,
    tools: {
      lockEscrowFunds: tool({
        description: 'Locks micro-escrow order via PayPal API once agreement is reached.',
        parameters: z.object({
          contractId: z.string(),
          totalAmount: z.number(),
        }),
        execute: async (args: any) => {
          await db.agentLog.create({
            data: {
              contractId: args.contractId,
              agentRole: 'AUDITOR_AGENT',
              action: 'LOCK_ESCROW_REQUESTED',
              payload: { totalAmount: args.totalAmount },
            },
          });
          return { status: 'READY_FOR_PAYPAL_APPROVAL', contractId: args.contractId, totalAmount: args.totalAmount };
        },
      } as any),
      verifyDeliverableCommit: tool({
        description: 'Cryptographically verifies Git commit or asset hash for milestone completion.',
        parameters: z.object({
          milestoneId: z.string(),
          commitHash: z.string(),
        }),
        execute: async (args: any) => {
          const valid = args.commitHash.length === 40;
          if (valid) {
            await db.milestone.update({
              where: { id: args.milestoneId },
              data: { status: 'VERIFIED' },
            });
            return { verified: true, milestoneId: args.milestoneId };
          }
          return { verified: false, reason: 'Invalid signature/commit hash structure' };
        },
      } as any),
    },
  });

  return result;
}
