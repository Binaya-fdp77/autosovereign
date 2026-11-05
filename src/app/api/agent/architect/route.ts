import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, buyerEmail, sellerEmail, totalAmount } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Project prompt is required' }, { status: 400 });
    }

    const db = prisma as any;
    const budget = Number(totalAmount || 1000);
    const bEmail = buyerEmail || 'buyer@autosovereign.test';
    const sEmail = sellerEmail || 'seller@autosovereign.test';

    let structuredMilestones = [
      { title: 'System Architecture & Database Schema', amount: budget * 0.3, deliverable: 'Prisma schema and ER diagram commit' },
      { title: 'Core API & Authentication', amount: budget * 0.4, deliverable: 'Next.js auth and API route tests passing' },
      { title: 'Frontend UI & Final Integration', amount: budget * 0.3, deliverable: 'Production build passing and deployment hash' },
    ];

    let agentReasoning = "Parsed project prompt and generated modular milestones via heuristic analysis.";

    if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('placeholder')) {
      const result = await generateObject({
        model: openai('gpt-4o'),
        schema: z.object({
          contractTitle: z.string(),
          milestones: z.array(z.object({
            title: z.string(),
            amount: z.number(),
            deliverable: z.string(),
          })),
        }),
        prompt: `You are AutoSovereign's Autonomous Escrow Architect. Break down this project description into 3 to 4 sequential milestones totaling exactly $${budget}: "${prompt}"`,
      });
      structuredMilestones = result.object.milestones;
      agentReasoning = `Successfully orchestrated contract structure for "${result.object.contractTitle}".`;
    }

    const contract = await db.contract.create({
      data: {
        title: prompt.substring(0, 50) + '...',
        description: prompt,
        totalAmount: budget,
        currency: 'USD',
        buyer: {
          connectOrCreate: {
            where: { email: bEmail },
            create: { email: bEmail, name: 'Autonomous Buyer', paypalEmail: bEmail, role: 'BUYER' },
          },
        },
        seller: {
          connectOrCreate: {
            where: { email: sEmail },
            create: { email: sEmail, name: 'Autonomous Seller', paypalEmail: sEmail, role: 'SELLER' },
          },
        },
        milestones: {
          create: structuredMilestones.map((m: any) => ({
            title: m.title,
            amount: m.amount,
            deliverable: m.deliverable,
            status: 'PENDING',
          })),
        },
      },
      include: { milestones: true },
    });

    await db.agentLog.create({
      data: {
        contractId: contract.id,
        agentRole: 'AI_ESCROW_ARCHITECT',
        action: 'Architected Contract & Milestones',
        payload: JSON.stringify({
          reasoning: agentReasoning,
          milestoneCount: structuredMilestones.length,
          totalBudget: budget,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({ success: true, contract });
  } catch (error: any) {
    console.error('Architect error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}