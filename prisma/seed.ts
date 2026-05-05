import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL é obrigatória para o seed (defina no .env).');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const DEMO_SLUG = 'seed_demo_room';

async function main() {
  await prisma.user.deleteMany({ where: { email: 'seed@vaicomprar.local' } });
  await prisma.room.deleteMany({ where: { slug: DEMO_SLUG } });

  const user = await prisma.user.create({
    data: {
      name: 'Usuário Seed',
      email: 'seed@vaicomprar.local',
      passwordHash: 'seed-placeholder',
    },
  });

  await prisma.room.create({
    data: {
      slug: DEMO_SLUG,
      name: 'Sala demonstração (seed)',
      createdById: user.id,
      plannedDate: new Date(Date.now() + 86400000),
      items: {
        create: [
          {
            name: 'Arroz',
            quantity: '5 kg',
            category: 'COMIDA',
          },
          {
            name: 'Detergente',
            quantity: '1',
            category: 'LIMPEZA',
          },
        ],
      },
    },
  });

  console.log(`Seed OK — sala slug: ${DEMO_SLUG}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
