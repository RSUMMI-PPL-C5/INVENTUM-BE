import { parseArgs } from "node:util";
import { PrismaClient } from "@prisma/client";
import { seedDevelopment } from "./seeds/development";
import { seedTest } from "./seeds/test";

const prisma = new PrismaClient();

const options = {
  environment: { type: "string" as const },
};

async function main() {
  const {
    values: { environment },
  } = parseArgs({ options });

  switch (environment) {
    case "development":
      await seedDevelopment();
      break;
    case "test":
      await seedTest();
      break;
    default:
      console.log("Please specify environment: development or test");
      break;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
