import { config } from 'dotenv';
config();
import { runAgentNegotiation } from '../src/lib/agent/state-machine';
import { prisma } from '../src/lib/db/prisma';

async function testFlow() {
  const db = prisma as any;
  console.log('Initializing test contract in database...');

  const buyer = await db.user.upsert({
    where: { email: 'buyer@autosovereign.test' },
    update: {},
    create: { email: 'buyer@autosovereign.test', name: 'Alice Buyer', paypalEmail: 'buyer-paypal@autosovereign.test', role: 'BUYER' }
  });

  const seller = await db.user.upsert({
    where: { email: 'seller@autosovereign.test' },
    update: {},
    create: { email: 'seller@autosovereign.test', name: 'Bob Seller', paypalEmail: 'seller-paypal@autosovereign.test', role: 'SELLER' }
  });

  const contract = await db.contract.create({
    data: {
      title: 'Autonomous Micro-Services Deployment',
      description: 'Deploying smart contract infrastructure with automated escrow release.',
      totalAmount: 1500.00,
      buyerId: buyer.id,
      sellerId: seller.id,
      milestones: {
        create: [
          { title: 'Milestone 1: Repository Architecture', deliverable: 'GitHub commit hash verification', amount: 500.00 },
          { title: 'Milestone 2: Mainnet Deployment', deliverable: 'Verified contract address verification', amount: 1000.00 }
        ]
      }
    }
  });

  console.log(`Created test contract: ${contract.id}`);
  console.log('Triggering AutoSovereign Agent Negotiation...');

  const result = await runAgentNegotiation(
    contract.id, 
    "Please verify the deliverable for Milestone 1. The commit hash is abcdef1234567890abcdef1234567890abcdef12."
  );

  console.log('Agent Execution Result:');
  console.log(result.text);
}

testFlow().catch(console.error);
