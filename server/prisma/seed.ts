import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing tables (ratings -> stores -> users)
  await prisma.rating.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  const hashedAdminPassword = await bcrypt.hash('Admin@12345', 10);
  const hashedOwnerPassword = await bcrypt.hash('Owner@12345', 10);
  const hashedUserPassword = await bcrypt.hash('User@12345', 10);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator User',
      email: 'admin@storerating.com',
      password: hashedAdminPassword,
      address: 'Headquarters Suite 100, Admin Boulevard, Tech City',
      role: 'ADMIN'
    }
  });

  // 2. Create Store Owners
  const owner1 = await prisma.user.create({
    data: {
      name: 'Alexander Montgomery Harrison',
      email: 'a.harrison@corporate.org',
      password: hashedOwnerPassword,
      address: '452 Industrial Parkway, Suite 100, Innovation District',
      role: 'STORE_OWNER'
    }
  });

  const owner2 = await prisma.user.create({
    data: {
      name: 'Elizabeth Vance Sterling',
      email: 'e.sterling@artisanbakes.com',
      password: hashedOwnerPassword,
      address: '789 Market Street, Gourmet Quarter, Metro City',
      role: 'STORE_OWNER'
    }
  });

  const owner3 = await prisma.user.create({
    data: {
      name: 'Marcus Aurelius Gallagher',
      email: 'm.gallagher@urbanfitness.com',
      password: hashedOwnerPassword,
      address: '120 Olympic Way, North Arena Center, Capital City',
      role: 'STORE_OWNER'
    }
  });

  const owner4Available = await prisma.user.create({
    data: {
      name: 'Sophia Beatrice Montgomery',
      email: 'sophia.montgomery@retailholdings.com',
      password: hashedOwnerPassword,
      address: '300 Waterfront Promenade, Harbor District, Bay City',
      role: 'STORE_OWNER'
    }
  });

  // 3. Create Stores
  const store1 = await prisma.store.create({
    data: {
      name: 'Central Roasters Cafe',
      email: 'contact@centralroasters.com',
      address: '452 Industrial Parkway, Suite 100',
      ownerId: owner1.id
    }
  });

  const store2 = await prisma.store.create({
    data: {
      name: 'Artisan Pastry & Sourdough Bakery',
      email: 'orders@artisanbakes.com',
      address: '789 Market Street, Gourmet Quarter',
      ownerId: owner2.id
    }
  });

  const store3 = await prisma.store.create({
    data: {
      name: 'Apex Fitness & Health Studio',
      email: 'frontdesk@apexfitness.com',
      address: '120 Olympic Way, North Arena Center',
      ownerId: owner3.id
    }
  });

  // 4. Create Normal Users
  const user1 = await prisma.user.create({
    data: {
      name: 'Jonathan Robert Davenport',
      email: 'user@storerating.com',
      password: hashedUserPassword,
      address: '14 Elmwood Terrace, Residential Heights, Spring Valley',
      role: 'USER'
    }
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Catherine Grace Wellington',
      email: 'catherine.w@outlookmail.com',
      password: hashedUserPassword,
      address: '88 Pinecrest Boulevard, Evergreen Park, Riverdale',
      role: 'USER'
    }
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Christopher James Bennett',
      email: 'chris.bennett@enterprise.net',
      password: hashedUserPassword,
      address: '672 Maple Ridge Lane, Sunnyvale Valley, Springfield',
      role: 'USER'
    }
  });

  // 5. Create Ratings
  await prisma.rating.createMany({
    data: [
      {
        storeId: store1.id,
        userId: user1.id,
        rating: 5
      },
      {
        storeId: store1.id,
        userId: user2.id,
        rating: 4
      },
      {
        storeId: store1.id,
        userId: user3.id,
        rating: 5
      },
      {
        storeId: store2.id,
        userId: user1.id,
        rating: 4
      },
      {
        storeId: store2.id,
        userId: user2.id,
        rating: 5
      },
      {
        storeId: store3.id,
        userId: user2.id,
        rating: 5
      },
      {
        storeId: store3.id,
        userId: user3.id,
        rating: 3
      }
    ]
  });

  console.log('✅ Database seeded successfully!');
  console.log('Demo Credentials:');
  console.log('Admin:       admin@storerating.com / Admin@12345');
  console.log('Store Owner: a.harrison@corporate.org / Owner@12345');
  console.log('Normal User: user@storerating.com / User@12345');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

