const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with default users...');

  // Create Default Buyer
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@autosovereign.test' },
    update: {},
    create: {
      name: 'Alice Buyer',
      email: 'buyer@autosovereign.test',
      paypalEmail: 'buyer-paypal@autosovereign.test',
      role: 'BUYER',
    },
  });

  // Create Default Contractor / Seller
  const seller = await prisma.user.upsert({
    where: { email: 'seller@autosovereign.test' },
    update: {},
    create: {
      name: 'Bob Seller',
      email: 'seller@autosovereign.test',
      paypalEmail: 'seller-paypal@autosovereign.test',
      role: 'SELLER',
    },
  });

  console.log('Seeding finished successfully:', { buyer, seller });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });