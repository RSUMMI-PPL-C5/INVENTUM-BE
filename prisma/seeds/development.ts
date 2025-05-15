import { PrismaClient, RequestType } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function seedDevelopment() {
  console.log("Seeding development data...");

  // Create ListDivisi first since it's referenced by User
  const divisiData = [
    { divisi: "Medical", parentId: null },
    { divisi: "Engineering", parentId: null },
    { divisi: "IT", parentId: null },
    { divisi: "Doctor", parentId: 1 },
    { divisi: "Nurse", parentId: 1 },
    { divisi: "Lab", parentId: 1 },
  ];

  for (const divisi of divisiData) {
    await prisma.listDivisi.upsert({
      where: { divisi: divisi.divisi },
      update: {},
      create: divisi,
    });
  }

  // Create Admin User first
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@inventum.com" },
    update: {},
    create: {
      id: uuidv4(),
      email: "admin@inventum.com",
      username: "admininventum",
      password: await bcrypt.hash("password", 10),
      role: "Admin",
      fullname: "admin inventum",
      nokar: "ADM001",
      divisiId: 1,
      waNumber: faker.phone.number(),
      createdBy: null,
      createdOn: new Date(),
    },
  });

  // Create Users
  const users: { id: string; role: string }[] = [adminUser];
  const fasumUsers: { id: string }[] = [];
  const regularUsers: { id: string }[] = [];

  for (let i = 0; i < 3; i++) {
    const fasumUser = await prisma.user.upsert({
      where: { email: `fasum${i + 1}@inventum.com` },
      update: {},
      create: {
        id: uuidv4(),
        email: `fasum${i + 1}@inventum.com`,
        username: `fasum${i + 1}`,
        password: await bcrypt.hash(`fasum${i + 1}123`, 10),
        role: "Fasum",
        fullname: faker.person.fullName(),
        nokar: `FAS${i + 1}`,
        divisiId: faker.number.int({ min: 1, max: 6 }),
        waNumber: faker.phone.number(),
        createdBy: adminUser.id,
        createdOn: new Date(),
      },
    });
    users.push(fasumUser);
    fasumUsers.push(fasumUser);
  }

  for (let i = 0; i < 6; i++) {
    const regularUser = await prisma.user.upsert({
      where: { email: `user${i + 1}@inventum.com` },
      update: {},
      create: {
        id: uuidv4(),
        email: `user${i + 1}@inventum.com`,
        username: `user${i + 1}`,
        password: await bcrypt.hash(`user${i + 1}123`, 10),
        role: "User",
        fullname: faker.person.fullName(),
        nokar: `USR${i + 1}`,
        divisiId: faker.number.int({ min: 1, max: 6 }),
        waNumber: faker.phone.number(),
        createdBy: adminUser.id,
        createdOn: new Date(),
      },
    });
    users.push(regularUser);
    regularUsers.push(regularUser);
  }

  // Create Spareparts
  const spareparts: { id: string }[] = [];
  for (let i = 0; i < 15; i++) {
    const sparepart = await prisma.spareparts.upsert({
      where: { id: `SPR${i + 1}` },
      update: {},
      create: {
        id: `SPR${i + 1}`,
        partsName: `Spare Part ${i + 1}`,
        purchaseDate: faker.date.past(),
        price: faker.number.int({ min: 100000, max: 5000000 }),
        toolLocation: `Room ${faker.number.int({ min: 101, max: 999 })}`,
        toolDate: faker.date.recent().toISOString(),
        createdBy: adminUser.id,
        createdOn: new Date(),
      },
    });
    spareparts.push(sparepart);
  }

  // Create Medical Equipment
  const medicalEquipment: { id: string; name: string }[] = [];
  for (let i = 0; i < 20; i++) {
    const equipment = await prisma.medicalEquipment.upsert({
      where: { id: `EQP${i + 1}` },
      update: {},
      create: {
        id: `EQP${i + 1}`,
        inventorisId: faker.string.alphanumeric(8).toUpperCase(),
        name: `Equipment ${i + 1}`,
        brandName: faker.company.name(),
        modelName: faker.commerce.productAdjective(),
        purchaseDate: faker.date.past(),
        purchasePrice: faker.number.int({ min: 1000000, max: 100000000 }),
        status: faker.helpers.arrayElement([
          "Active",
          "Inactive",
          "Maintenance",
        ]),
        vendor: faker.company.name(),
        lastLocation: `Room ${faker.number.int({ min: 101, max: 999 })}`,
        createdBy: adminUser.id,
        createdOn: new Date(),
      },
    });
    medicalEquipment.push(equipment);
  }

  // Create Parts History
  for (let i = 0; i < 30; i++) {
    await prisma.partsHistory.upsert({
      where: { id: `PH${i + 1}` },
      update: {},
      create: {
        id: `PH${i + 1}`,
        medicalEquipmentId: faker.helpers.arrayElement(medicalEquipment).id,
        sparepartId: faker.helpers.arrayElement(spareparts).id,
        actionPerformed: faker.lorem.paragraph(),
        technician: faker.person.fullName(),
        result: faker.helpers.arrayElement(["Success", "Partial", "Failed"]),
        replacementDate: faker.date.recent(),
        createdBy: faker.helpers.arrayElement(fasumUsers).id,
      },
    });
  }

  // Create Requests
  const requests: { id: string }[] = [];
  for (let i = 0; i < 25; i++) {
    const request = await prisma.request.upsert({
      where: { id: `REQ${i + 1}` },
      update: {},
      create: {
        id: `REQ${i + 1}`,
        userId: faker.helpers.arrayElement(regularUsers).id,
        medicalEquipment: faker.helpers.arrayElement(medicalEquipment).name,
        complaint: faker.lorem.sentence(),
        status: faker.helpers.arrayElement([
          "Pending",
          "On Progress",
          "Completed",
        ]),
        createdBy: faker.helpers.arrayElement(regularUsers).id,
        requestType: faker.helpers.arrayElement([
          RequestType.MAINTENANCE,
          RequestType.CALIBRATION,
        ]),
      },
    });
    requests.push(request);
  }

  // Create Comments
  for (let i = 0; i < 40; i++) {
    await prisma.comment.upsert({
      where: { id: `COM${i + 1}` },
      update: {},
      create: {
        id: `COM${i + 1}`,
        text: faker.lorem.paragraph(),
        userId: faker.helpers.arrayElement([...regularUsers, ...fasumUsers]).id,
        requestId: faker.helpers.arrayElement(requests).id,
      },
    });
  }

  // Create Maintenance History
  for (let i = 0; i < 20; i++) {
    await prisma.maintenanceHistory.upsert({
      where: { id: `MH${i + 1}` },
      update: {},
      create: {
        id: `MH${i + 1}`,
        medicalEquipmentId: faker.helpers.arrayElement(medicalEquipment).id,
        actionPerformed: faker.lorem.paragraph(),
        technician: faker.person.fullName(),
        result: faker.helpers.arrayElement(["Success", "Partial", "Failed"]),
        maintenanceDate: faker.date.recent(),
        createdBy: faker.helpers.arrayElement(fasumUsers).id,
      },
    });
  }

  // Create Calibration History
  for (let i = 0; i < 15; i++) {
    await prisma.calibrationHistory.upsert({
      where: { id: `CH${i + 1}` },
      update: {},
      create: {
        id: `CH${i + 1}`,
        medicalEquipmentId: faker.helpers.arrayElement(medicalEquipment).id,
        actionPerformed: faker.lorem.paragraph(),
        technician: faker.person.fullName(),
        result: faker.helpers.arrayElement(["Success", "Partial", "Failed"]),
        calibrationDate: faker.date.recent(),
        calibrationMethod: faker.helpers.arrayElement([
          "Standard",
          "Advanced",
          "Specialized",
        ]),
        nextCalibrationDue: faker.date.future(),
        createdBy: faker.helpers.arrayElement(fasumUsers).id,
      },
    });
  }

  console.log("Development data seeded successfully!");
}
