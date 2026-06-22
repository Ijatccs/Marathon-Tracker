import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CHECKPOINTS = [
  { slug: "start", name: "Starting Line", order: 0 },
  { slug: "cp1", name: "CP 1", order: 1 },
  { slug: "cp2", name: "CP 2", order: 2 },
  { slug: "finish", name: "Finish Line", order: 3 },
];

async function main() {
  console.log("Seeding database...");

  for (const checkpoint of CHECKPOINTS) {
    await prisma.checkpoint.upsert({
      where: { slug: checkpoint.slug },
      update: { name: checkpoint.name, order: checkpoint.order },
      create: checkpoint,
    });
  }

  for (let i = 1; i <= 50; i++) {
    const bibNumber = `RN${String(i).padStart(3, "0")}`;
    await prisma.participant.upsert({
      where: { bibNumber },
      update: {},
      create: { bibNumber },
    });
  }

  console.log("Seeded 4 checkpoints and 50 participants (RN001–RN050)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
