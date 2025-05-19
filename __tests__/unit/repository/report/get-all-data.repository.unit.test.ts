import ReportRepository from "../../../../src/repository/report.repository";
import prisma from "../../../../src/configs/db.config";

type MockPrismaModel = {
  findMany: jest.Mock;
};

type MockPrismaClient = {
  user: MockPrismaModel;
  listDivisi: MockPrismaModel;
  medicalEquipment: MockPrismaModel;
  spareparts: MockPrismaModel;
  partsHistory: MockPrismaModel;
  request: MockPrismaModel;
  maintenanceHistory: MockPrismaModel;
  calibrationHistory: MockPrismaModel;
  notifikasi: MockPrismaModel;
  comment: MockPrismaModel;
};

jest.mock("../../../../src/configs/db.config", () => ({
  user: {
    findMany: jest.fn(),
  },
  listDivisi: {
    findMany: jest.fn(),
  },
  medicalEquipment: {
    findMany: jest.fn(),
  },
  spareparts: {
    findMany: jest.fn(),
  },
  partsHistory: {
    findMany: jest.fn(),
  },
  request: {
    findMany: jest.fn(),
  },
  maintenanceHistory: {
    findMany: jest.fn(),
  },
  calibrationHistory: {
    findMany: jest.fn(),
  },
  notifikasi: {
    findMany: jest.fn(),
  },
  comment: {
    findMany: jest.fn(),
  },
}));

describe("ReportRepository - getAllData", () => {
  let repository: ReportRepository;
  const startDate = new Date("2024-01-01");
  const endDate = new Date("2024-12-31");

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new ReportRepository();
  });

  it("should successfully retrieve all data within date range", async () => {
    const mockData = {
      users: [{ id: "user1", username: "testuser" }],
      divisions: [{ id: 1, divisi: "IT" }],
      equipment: [{ id: "equip1", name: "MRI" }],
      spareparts: [{ id: "part1", partsName: "Bolt" }],
      partsHistory: [{ id: "hist1", actionPerformed: "Replacement" }],
      requests: [{ id: "req1", status: "Pending" }],
      maintenanceHistory: [{ id: "maint1", result: "Success" }],
      calibrationHistory: [{ id: "cal1", result: "Success" }],
      notifications: [{ id: "notif1", message: "New request" }],
      comments: [{ id: "comment1", text: "Test comment" }],
    };

    (prisma.user.findMany as jest.Mock).mockResolvedValue(mockData.users);
    (prisma.listDivisi.findMany as jest.Mock).mockResolvedValue(
      mockData.divisions,
    );
    (prisma.medicalEquipment.findMany as jest.Mock).mockResolvedValue(
      mockData.equipment,
    );
    (prisma.spareparts.findMany as jest.Mock).mockResolvedValue(
      mockData.spareparts,
    );
    (prisma.partsHistory.findMany as jest.Mock).mockResolvedValue(
      mockData.partsHistory,
    );
    (prisma.request.findMany as jest.Mock).mockResolvedValue(mockData.requests);
    (prisma.maintenanceHistory.findMany as jest.Mock).mockResolvedValue(
      mockData.maintenanceHistory,
    );
    (prisma.calibrationHistory.findMany as jest.Mock).mockResolvedValue(
      mockData.calibrationHistory,
    );
    (prisma.notifikasi.findMany as jest.Mock).mockResolvedValue(
      mockData.notifications,
    );
    (prisma.comment.findMany as jest.Mock).mockResolvedValue(mockData.comments);

    const result = await repository.getAllData(startDate, endDate);

    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: {
        createdOn: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    expect(prisma.listDivisi.findMany).toHaveBeenCalled();

    expect(prisma.medicalEquipment.findMany).toHaveBeenCalledWith({
      where: {
        createdOn: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    expect(prisma.spareparts.findMany).toHaveBeenCalled();
    expect(prisma.partsHistory.findMany).toHaveBeenCalled();
    expect(prisma.request.findMany).toHaveBeenCalled();
    expect(prisma.maintenanceHistory.findMany).toHaveBeenCalled();
    expect(prisma.calibrationHistory.findMany).toHaveBeenCalled();
    expect(prisma.notifikasi.findMany).toHaveBeenCalled();
    expect(prisma.comment.findMany).toHaveBeenCalled();

    expect(result).toEqual(mockData);
  });

  it("should handle empty results from all queries", async () => {
    const emptyData = {
      users: [],
      divisions: [],
      equipment: [],
      spareparts: [],
      partsHistory: [],
      requests: [],
      maintenanceHistory: [],
      calibrationHistory: [],
      notifications: [],
      comments: [],
    };

    Object.values(prisma as unknown as MockPrismaClient).forEach((model) => {
      if (model.findMany) {
        model.findMany.mockResolvedValue([]);
      }
    });

    const result = await repository.getAllData(startDate, endDate);

    expect(result).toEqual(emptyData);
  });

  it("should throw error when database query fails", async () => {
    const dbError = new Error("Database connection failed");
    (prisma.user.findMany as jest.Mock).mockRejectedValue(dbError);

    await expect(repository.getAllData(startDate, endDate)).rejects.toThrow(
      "Database connection failed",
    );
  });

  it("should handle partial database failure", async () => {
    const dbError = new Error("Database connection failed");
    const mockData = {
      users: [{ id: "user1", username: "testuser" }],
      divisions: [{ id: 1, divisi: "IT" }],
    };

    (prisma.user.findMany as jest.Mock).mockResolvedValue(mockData.users);
    (prisma.listDivisi.findMany as jest.Mock).mockResolvedValue(
      mockData.divisions,
    );
    (prisma.medicalEquipment.findMany as jest.Mock).mockRejectedValue(dbError);

    await expect(repository.getAllData(startDate, endDate)).rejects.toThrow(
      "Database connection failed",
    );
  });
});
