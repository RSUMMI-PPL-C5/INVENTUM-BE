import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // Clear existing data to avoid conflicts
  console.log("Cleaning up existing data...");
  await prisma.comment.deleteMany();
  await prisma.notifikasi.deleteMany();
  await prisma.request.deleteMany();
  await prisma.equipmentSpareparts.deleteMany();
  await prisma.partsManagement.deleteMany();
  await prisma.relocationHistory.deleteMany();
  await prisma.spareparts.deleteMany();
  await prisma.medicalEquipment.deleteMany();
  await prisma.user.deleteMany();
  await prisma.listDivisi.deleteMany();

  // Seed ListDivisi
  console.log("Seeding divisions...");

  // First, create all divisions without parents
  const divisionData = [
    { id: 1, divisi: "Dokter Spesialis", parentId: 47 },
    { id: 2, divisi: "Rawat Jalan", parentId: 48 },
    { id: 3, divisi: "Radiologi", parentId: 49 },
    { id: 4, divisi: "IGD", parentId: 48 },
    { id: 5, divisi: "ICU", parentId: 48 },
    { id: 6, divisi: "Laboratorium", parentId: 49 },
    { id: 7, divisi: "Hemodialisa", parentId: 48 },
    { id: 8, divisi: "Pelayanan Medis", parentId: 47 },
    { id: 9, divisi: "Penunjang Medis", parentId: 49 },
    { id: 10, divisi: "Gizi", parentId: 47 },
    { id: 11, divisi: "Kamar Bersalin (VK)", parentId: 48 },
    { id: 12, divisi: "Rawat Inap", parentId: 48 },
    { id: 13, divisi: "Keperawatan", parentId: 48 },
    { id: 14, divisi: "Perinatologi", parentId: 48 },
    { id: 15, divisi: "IPCN", parentId: 48 },
    { id: 16, divisi: "Casemix", parentId: 61 },
    { id: 17, divisi: "Bedah Sentral", parentId: 48 },
    { id: 18, divisi: "Kamar Bersalin", parentId: 48 },
    { id: 19, divisi: "Sterilisasi Pusat", parentId: 48 },
    { id: 20, divisi: "Komite Keperawatan", parentId: 48 },
    { id: 21, divisi: "Customer Service", parentId: 50 },
    { id: 22, divisi: "Cleaning Service", parentId: 52 },
    { id: 23, divisi: "NICU/PICU", parentId: 48 },
    { id: 24, divisi: "Farmasi", parentId: 49 },
    { id: 25, divisi: "Rehab Medik", parentId: 47 },
    { id: 26, divisi: "Rekam Medis", parentId: 47 },
    { id: 27, divisi: "IPSRS", parentId: 52 },
    { id: 28, divisi: "IT", parentId: 62 },
    { id: 29, divisi: "Content Creator", parentId: 55 },
    { id: 30, divisi: "Umum", parentId: 52 },
    { id: 31, divisi: "Kasir", parentId: 54 },
    { id: 32, divisi: "Keuangan", parentId: 54 },
    { id: 33, divisi: "SDM & Diklat", parentId: 53 },
    { id: 34, divisi: "Rumah Tangga", parentId: 52 },
    { id: 35, divisi: "Front Office (FO)", parentId: 50 },
    { id: 36, divisi: "Security", parentId: 52 },
    { id: 37, divisi: "Pemasaran", parentId: 50 },
    { id: 38, divisi: "operator", parentId: 50 },
    { id: 39, divisi: "Internal Affair & Legal", parentId: 59 },
    { id: 40, divisi: "Sanitasi", parentId: 52 },
    { id: 41, divisi: "Programmer", parentId: 55 },
    { id: 42, divisi: "Mutu", parentId: 48 },
    { id: 43, divisi: "Linen", parentId: 52 },
    { id: 44, divisi: "K3RS", parentId: 52 },
    { id: 45, divisi: "UI/UX", parentId: 41 },
    { id: 46, divisi: "Pengadaan", parentId: 52 },
    { id: 47, divisi: "Manajer Medik", parentId: 63 },
    { id: 48, divisi: "Manajer Keperawatan", parentId: 63 },
    { id: 49, divisi: "Manajer Penunjang Medik", parentId: 63 },
    { id: 50, divisi: "Manajer Customer Relation", parentId: 64 },
    { id: 51, divisi: "Manajer SIMRS", parentId: 64 },
    { id: 52, divisi: "Manajer Umum", parentId: 64 },
    { id: 53, divisi: "Manajer SDM", parentId: 64 },
    { id: 54, divisi: "Manajer Keuangan", parentId: 56 },
    { id: 55, divisi: "Chief Of Technology Officer", parentId: 59 },
    { id: 56, divisi: "Chief Of Finance", parentId: 59 },
    {
      id: 57,
      divisi: "Chief of Business Development & Marketing ",
      parentId: 59,
    },
    {
      id: 58,
      divisi: "Chief of Purchasing, Internal Audit & Marketing",
      parentId: 59,
    },
    { id: 59, divisi: "Chief Operating Officer", parentId: null },
    { id: 60, divisi: "Associate Chief Operation Officer", parentId: 59 },
    { id: 61, divisi: "Manajer Casemix", parentId: 63 },
    { id: 62, divisi: "Manajer IT", parentId: 64 },
    { id: 63, divisi: "Direktur Pelayanan Medis", parentId: 59 },
    { id: 64, divisi: "Direktur Umum", parentId: 59 },
    { id: 65, divisi: "Case Manager", parentId: 47 },
  ];

  // First create the root division (Chief Operating Officer)
  await prisma.listDivisi.create({
    data: {
      id: 59,
      divisi: "Chief Operating Officer",
      parentId: null,
    },
  });

  console.log("Created root division");

  // Create all divisions that have parentId = 59 (direct reports to COO)
  const directReportsToCOO = divisionData.filter(
    (div) => div.parentId === 59 && div.id !== 59,
  );

  for (const division of directReportsToCOO) {
    await prisma.listDivisi.create({
      data: {
        id: division.id,
        divisi: division.divisi,
        parentId: division.parentId,
      },
    });
  }

  console.log("Created direct reports to COO");

  // Then create all other divisions level by level
  const remainingDivisions = divisionData.filter(
    (div) => div.id !== 59 && div.parentId !== 59,
  );

  for (const division of remainingDivisions) {
    try {
      await prisma.listDivisi.create({
        data: {
          id: division.id,
          divisi: division.divisi,
          parentId: division.parentId,
        },
      });
    } catch (error) {
      console.log(
        `Error creating division ${division.id} (${division.divisi}): ${error.message}`,
      );
    }
  }

  console.log("Completed seeding divisions");

  // Create admin and regular user
  console.log("Creating users...");

  const hashedAdminPassword = await bcrypt.hash("admin123", 10);
  const hashedUserPassword = await bcrypt.hash("user123", 10);

  const adminUser = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: "admin@inventum.com",
      username: "admin",
      password: hashedAdminPassword,
      role: "ADMIN",
      fullname: "Administrator",
      nokar: "ADM001",
      divisiId: 28, // IT division
      waNumber: "081234567890",
      createdOn: new Date(),
      modifiedOn: new Date(),
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: "user@inventum.com",
      username: "user",
      password: hashedUserPassword,
      role: "USER",
      fullname: "Regular User",
      nokar: "USR001",
      divisiId: 8, // Pelayanan Medis
      waNumber: "089876543210",
      createdOn: new Date(),
      modifiedOn: new Date(),
    },
  });

  console.log("Created admin and regular user accounts");
  console.log("Admin User:", adminUser.username);
  console.log("Regular User:", regularUser.username);

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
