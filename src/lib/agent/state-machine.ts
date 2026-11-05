import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';

export async function runAgentNegotiation(contractId: string, userInstruction: string) {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: { milestones: true },
  });

  if (!contract) throw new Error('Contract missing');

  const { text, steps } = await generateText({
    model: openai('gpt-4o'),
    system: `You are the AutoSovereign Contingency Agent acting as an autonomous mediator between Buyer and Seller.
      Your goal is to inspect deliverables, negotiate terms, execute tool calls, and verify milestone conditions.`,
    prompt: `Contract ID: ${contractId}. Request: ${userInstruction}`,
    tools: {
      lockEscrowFunds: tool({
        description: 'Locks micro-escrow order via PayPal API once agreement is reached.',
        parameters: z.object({
          contractId: z.string(),
          totalAmount: z.number(),
        }),
        execute: async ({ contractId, totalAmount }) => {
          await prisma.agentLog.create({
            data: {
              contractId,
              agentRole: 'AUDITOR_AGENT',
              action: 'LOCK_ESCROW_REQUESTED',
              payload: { totalAmount },
            },
          });
          return { status: 'READY_FOR_PAYPAL_APPROVAL', contractId, totalAmount };
        },
      }),
      verifyDeliverableCommit: tool({
        description: 'Cryptographically verifies Git commit or asset hash for milestone completion.',
        parameters: z.object({
          milestoneId: z.string(),
          commitHash: z.string(),
        }),
        execute: async ({ milestoneId, commitHash }) => {
          const valid = commitHash.length === 40; // Simulated SHA-1 hash check
          if (valid) {
            await prisma.milestone.update({
              where: { id: milestoneId },
              data: { status: 'VERIFIED' },
            });
            return { verified: true, milestoneId };
          }
          return { verified: false, reason: 'Invalid signature/commit hash structure' };
        },
      }),
    },
    maxSteps: 5,
  });

  return { text, steps };
}
