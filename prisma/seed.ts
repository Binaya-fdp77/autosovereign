import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@autosovereign.io' },
    update: {},
    create: {
      email: 'buyer@autosovereign.io',
      name: 'Acme Corp (Buyer)',
      paypalEmail: 'buyer-sandbox@autosovereign.io',
      role: 'BUYER',
    },
  });

  const seller = await prisma.user.upsert({
    where: { email: 'seller@autosovereign.io' },
    update: {},
    create: {
      email: 'seller@autosovereign.io',
      name: 'Elite Dev (Freelancer)',
      paypalEmail: 'seller-sandbox@autosovereign.io',
      role: 'FREELANCER',
    },
  });

  const contract = await prisma.contract.create({
    data: {
      title: 'Next.js Enterprise Architecture',
      description: 'Full-stack micro-escrow platform development.',
      totalAmount: 1500.00,
      currency: 'USD',
      buyerId: buyer.id,
      sellerId: seller.id,
      milestones: {
        create: [
          { title: 'Milestone 1: Core API & DB', deliverable: 'Prisma schema & PayPal v2 client', amount: 1500.00 },
        ],
      },
    },
  });

  console.log(`Test Contract Created! Contract ID: ${contract.id}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
