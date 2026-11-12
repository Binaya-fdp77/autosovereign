require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@autosovereign.test' },
    update: {},
    create: { name: 'Alice Buyer', email: 'buyer@autosovereign.test', role: 'BUYER' },
  });

  // Payouts go to this address, so it MUST be your sandbox PERSONAL account email.
  const sellerPaypal = process.env.SELLER_PAYPAL_EMAIL || 'unset@example.com';
  const seller = await prisma.user.upsert({
    where: { email: 'seller@autosovereign.test' },
    update: { paypalReceiverEmail: sellerPaypal },
    create: { name: 'Bob Seller', email: 'seller@autosovereign.test', role: 'SELLER', paypalReceiverEmail: sellerPaypal },
  });

  const contract = await prisma.contract.upsert({
    where: { id: 'demo-contract-1' },
    update: {},
    create: {
      id: 'demo-contract-1',
      title: 'Landing page build',
      description: 'Design and ship a responsive landing page with a contact form.',
      totalAmount: '100.00',
      currency: 'USD',
      status: 'NEGOTIATING',
      buyerId: buyer.id,
      sellerId: seller.id,
    },
  });

  const count = await prisma.milestone.count({ where: { contractId: contract.id } });
  if (count === 0) {
    await prisma.milestone.createMany({
      data: [
        { contractId: contract.id, title: 'Responsive layout delivered', amount: '40.00', deliverable: 'Layout with header, hero, features and footer, working on mobile and desktop.' },
        { contractId: contract.id, title: 'Contact form working', amount: '30.00', deliverable: 'Contact form validates input and submits to an endpoint.' },
        { contractId: contract.id, title: 'Deployed and handed over', amount: '30.00', deliverable: 'Site deployed to a public URL with source repo transferred.' },
      ],
    });
  }

  console.log('Seeded. Demo contract id:', contract.id);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());