import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      name: 'Alice',
      email: 'alice@example.com',
      bio: 'Hello, I am Alice!'
    }
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      name: 'Bob',
      email: 'bob@example.com',
      bio: 'Bob here.'
    }
  });

  await prisma.post.createMany({
    data: [
      { authorId: alice.id, content: "Welcome to Facebook Pro! This is Alice's first post." },
      { authorId: bob.id, content: "Hey! Bob here, testing the feed." }
    ]
  });

  console.log('Seed finished.');
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
