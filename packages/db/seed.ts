import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {

  await prisma.websiteTick.deleteMany();
  await prisma.website.deleteMany();
  await prisma.validator.deleteMany();
  await prisma.user.deleteMany();

  // Create new data
  const user = await prisma.user.create({
    data: {
      id: '2',
      email: 'test2@test.com',
      password: 'test',
    },
  });

  const website = await prisma.website.create({
    data: {
      url: 'https://test2.com',
      userId: user.id,  // Use the created user's ID
    },
  });   

  const validator = await prisma.validator.create({
    data: {
      publicKey: 'test_key',
      location: 'test_location',
      ip: '127.0.0.1',
    },
  });

  // Create ticks with the correct references
  await prisma.websiteTick.create({
    data: {
      websiteId: website.id,
      validatorId: validator.id,
      status: 'Good',
      latency: 100,
      createdAt: new Date(Date.now() - 1000 * 60 * 10),
    },  
  });
  await prisma.websiteTick.create({
    data: {
      websiteId: website.id,
      validatorId: validator.id,
      status: 'Bad',
      latency: 100,
      createdAt: new Date(Date.now() - 1000 * 60 * 20),
    },
  });
  await prisma.websiteTick.create({
    data: {
      websiteId: website.id,
      validatorId: validator.id,
      status: 'Good',
      latency: 100,
      createdAt: new Date(Date.now() - 1000 * 60 * 29),
    },
  });

}

seed();
