import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ============================================================
// SEED SCRIPT
// Creates exactly the 4 accounts required by the spec:
//   1 Admin + 3 Investors, each investor starting with:
//     - initial investment: 100 000 so'm
//     - ownership: exact fraction 1/3 (NOT 33.33%)
//     - balance (schot): 0
//   Business starts at 300 000 so'm.
// ============================================================

const DEFAULT_PASSWORD = 'ChangeMe123!'; // change immediately after first login

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  // --- Admin ---
  const admin = await prisma.user.upsert({
    where: { email: 'admin@business.local' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@business.local',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  // --- Business ---
  const business = await prisma.business.upsert({
    where: { id: 'main-business' },
    update: {},
    create: {
      id: 'main-business',
      name: 'Biznesim',
      currentValue: 300_000n,
    },
  });

  await prisma.businessValueHistory.create({
    data: { businessId: business.id, value: 300_000n, changedById: admin.id },
  });

  // --- 3 Investors, each with exact 1/3 ownership ---
  const investorSeeds = [
    { name: 'User 1', email: 'user1@business.local' },
    { name: 'User 2', email: 'user2@business.local' },
    { name: 'User 3', email: 'user3@business.local' },
  ];

  for (const seed of investorSeeds) {
    const user = await prisma.user.upsert({
      where: { email: seed.email },
      update: {},
      create: {
        name: seed.name,
        email: seed.email,
        passwordHash,
        role: Role.INVESTOR,
      },
    });

    await prisma.ownership.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, numerator: 1, denominator: 3 },
    });

    await prisma.investment.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, initialAmount: 100_000n },
    });

    await prisma.balance.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, currentAmount: 0n },
    });
  }

  console.log('✅ Seed complete.');
  console.log('');
  console.log('Login ma\'lumotlari (barchasi uchun bir xil parol):');
  console.log('  Admin:  admin@business.local');
  console.log('  User 1: user1@business.local');
  console.log('  User 2: user2@business.local');
  console.log('  User 3: user3@business.local');
  console.log(`  Parol:  ${DEFAULT_PASSWORD}`);
  console.log('');
  console.log('⚠️  Production\'ga chiqishdan oldin parollarni albatta o\'zgartiring.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
