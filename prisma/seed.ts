import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import * as developmentData from "./seeds/development";
import * as testData from "./seeds/test";

const prisma = new PrismaClient();

async function main() {
  // Menentukan environment berdasarkan variabel NODE_ENV
  const environment = process.env.NODE_ENV || "development";
  console.log(`Seeding database untuk environment: ${environment}`);

  // Pilih data seeding berdasarkan environment
  let seedData;
  switch (environment) {
    case "test":
      seedData = testData;
      break;
    default:
      seedData = developmentData;
  }

  try {
    // FIRST: Seed divisions before anything else
    if (seedData.divisions && seedData.divisions.length > 0) {
      console.log("Seeding divisions...");
      for (const division of seedData.divisions) {
        await prisma.listDivisi.upsert({
          where: { id: division.id },
          update: division,
          create: division,
        });
      }
      console.log(`✓ Seeded ${seedData.divisions.length} divisions`);
    }

    // THEN: Seed users with division references
    if (seedData.users && seedData.users.length > 0) {
      console.log("Seeding users...");
      for (const user of seedData.users) {
        await prisma.user.upsert({
          where: { email: user.email },
          update: user,
          create: {
            ...user,
            id: user.id || uuidv4(),
          },
        });
      }
      console.log(`✓ Seeded ${seedData.users.length} users`);
    }

    console.log("Database seeding completed successfully! 🎉");
  } catch (error) {
    console.error("Error during database seeding:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("Failed to seed database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
