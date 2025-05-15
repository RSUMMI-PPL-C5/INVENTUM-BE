import { PrismaClient, RequestType } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function seedTest() {
  console.log("Seeding test data...");

  // Create ListDivisi with fixed data
  const divisiData = [
    { divisi: "Test Division 1", parentId: null },
    { divisi: "Test Division 2", parentId: null },
  ];

  for (const divisi of divisiData) {
    await prisma.listDivisi.upsert({
      where: { divisi: divisi.divisi },
      update: {},
      create: divisi,
    });
  }

  // Create test users with fixed data
  const testAdmin = await prisma.user.upsert({
    where: { email: "test.admin@inventum.com" },
    update: {},
    create: {
      id: "test-admin-id",
      email: "test.admin@inventum.com",
      username: "testadmin",
      password: await bcrypt.hash("testadmin123", 10),
      role: "Admin",
      fullname: "Test Admin",
      nokar: "TEST-ADM-001",
      divisiId: 1,
      waNumber: "081234567890",
      createdBy: null,
      createdOn: new Date("2024-01-01"),
    },
  });

  const testFasum = await prisma.user.upsert({
    where: { email: "test.fasum@inventum.com" },
    update: {},
    create: {
      id: "test-fasum-id",
      email: "test.fasum@inventum.com",
      username: "testfasum",
      password: await bcrypt.hash("testfasum123", 10),
      role: "Fasum",
      fullname: "Test Fasum",
      nokar: "TEST-FAS-001",
      divisiId: 1,
      waNumber: "081234567891",
      createdBy: testAdmin.id,
      createdOn: new Date("2024-01-01"),
    },
  });

  const testUser = await prisma.user.upsert({
    where: { email: "test.user@inventum.com" },
    update: {},
    create: {
      id: "test-user-id",
      email: "test.user@inventum.com",
      username: "testuser",
      password: await bcrypt.hash("testuser123", 10),
      role: "User",
      fullname: "Test User",
      nokar: "TEST-USR-001",
      divisiId: 2,
      waNumber: "081234567892",
      createdBy: testAdmin.id,
      createdOn: new Date("2024-01-01"),
    },
  });

  // Create test spareparts
  const testSparepart = await prisma.spareparts.upsert({
    where: { id: "TEST-SPR-001" },
    update: {},
    create: {
      id: "TEST-SPR-001",
      partsName: "Test Spare Part 1",
      purchaseDate: new Date("2024-01-01"),
      price: 1000000,
      toolLocation: "Room 101",
      toolDate: new Date("2024-01-01").toISOString(),
      createdBy: testAdmin.id,
      createdOn: new Date("2024-01-01"),
    },
  });

  // Create test medical equipment
  const testEquipment = await prisma.medicalEquipment.upsert({
    where: { id: "TEST-EQP-001" },
    update: {},
    create: {
      id: "TEST-EQP-001",
      inventorisId: "TEST-INV-001",
      name: "Test Equipment 1",
      brandName: "Test Brand",
      modelName: "Test Model",
      purchaseDate: new Date("2024-01-01"),
      purchasePrice: 10000000,
      status: "Active",
      vendor: "Test Vendor",
      lastLocation: "Room 101",
      createdBy: testAdmin.id,
      createdOn: new Date("2024-01-01"),
    },
  });

  // Create test parts history
  await prisma.partsHistory.upsert({
    where: { id: "TEST-PH-001" },
    update: {},
    create: {
      id: "TEST-PH-001",
      medicalEquipmentId: testEquipment.id,
      sparepartId: testSparepart.id,
      actionPerformed: "Test maintenance action",
      technician: "Test Technician",
      result: "Success",
      replacementDate: new Date("2024-01-02"),
      createdBy: testFasum.id,
    },
  });

  // Create test request
  const testRequest = await prisma.request.upsert({
    where: { id: "TEST-REQ-001" },
    update: {},
    create: {
      id: "TEST-REQ-001",
      userId: testUser.id,
      medicalEquipment: testEquipment.name,
      complaint: "Test complaint message",
      status: "Pending",
      createdBy: testUser.id,
      requestType: RequestType.MAINTENANCE,
    },
  });

  // Create test comment
  await prisma.comment.upsert({
    where: { id: "TEST-COM-001" },
    update: {},
    create: {
      id: "TEST-COM-001",
      text: "Test comment message",
      userId: testUser.id,
      requestId: testRequest.id,
    },
  });

  // Create test maintenance history
  await prisma.maintenanceHistory.upsert({
    where: { id: "TEST-MH-001" },
    update: {},
    create: {
      id: "TEST-MH-001",
      medicalEquipmentId: testEquipment.id,
      actionPerformed: "Test maintenance action",
      technician: "Test Technician",
      result: "Success",
      maintenanceDate: new Date("2024-01-02"),
      createdBy: testFasum.id,
    },
  });

  // Create test calibration history
  await prisma.calibrationHistory.upsert({
    where: { id: "TEST-CH-001" },
    update: {},
    create: {
      id: "TEST-CH-001",
      medicalEquipmentId: testEquipment.id,
      actionPerformed: "Test calibration action",
      technician: "Test Technician",
      result: "Success",
      calibrationDate: new Date("2024-01-02"),
      calibrationMethod: "Standard",
      nextCalibrationDue: new Date("2024-07-02"),
      createdBy: testFasum.id,
    },
  });

  console.log("Test data seeded successfully!");
}
