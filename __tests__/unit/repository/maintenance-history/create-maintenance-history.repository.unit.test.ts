import MaintenanceHistoryRepository from "../../../../src/repository/maintenance-history.repository";
import prisma from "../../../../src/configs/db.config";
import { getJakartaTime } from "../../../../src/utils/date.utils";

// Mock the dependencies
jest.mock("../../../../src/configs/db.config", () => ({
  maintenanceHistory: {
    create: jest.fn(),
  },
}));

jest.mock("../../../../src/utils/date.utils", () => ({
  getJakartaTime: jest.fn(),
}));

describe("MaintenanceHistoryRepository - createMaintenanceHistory", () => {
  let repository: MaintenanceHistoryRepository;
  const mockDate = new Date("2025-04-28T12:00:00Z");

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new MaintenanceHistoryRepository();
    (getJakartaTime as jest.Mock).mockReturnValue(mockDate);
  });

  // Positive case - with all fields
  it("should create maintenance history with all fields", async () => {
    // Arrange
    const maintenanceData = {
      id: "maint123",
      actionPerformed: "Cleaned and calibrated",
      technician: "John Doe",
      result: "Successful",
      maintenanceDate: new Date("2025-04-28"),
      medicalEquipmentId: "equip123",
      createdBy: "user123",
    };

    const mockCreatedRecord = {
      ...maintenanceData,
      createdOn: mockDate,
      medicalEquipmentId: "equip123",
    };

    (prisma.maintenanceHistory.create as jest.Mock).mockResolvedValue(
      mockCreatedRecord,
    );

    // Act
    const result = await repository.createMaintenanceHistory(maintenanceData);

    // Assert
    expect(prisma.maintenanceHistory.create).toHaveBeenCalledWith({
      data: {
        id: maintenanceData.id,
        actionPerformed: maintenanceData.actionPerformed,
        technician: maintenanceData.technician,
        result: maintenanceData.result,
        maintenanceDate: maintenanceData.maintenanceDate,
        createdBy: maintenanceData.createdBy,
        createdOn: mockDate,
        medicalEquipment: {
          connect: {
            id: maintenanceData.medicalEquipmentId,
          },
        },
      },
    });

    expect(result).toEqual(mockCreatedRecord);
  });

  // Positive case - with minimal fields
  it("should create maintenance history with only required fields", async () => {
    // Arrange
    const maintenanceData = {
      id: "maint123",
      result: "Failed",
      maintenanceDate: new Date("2025-04-28"),
      medicalEquipmentId: "equip123",
      createdBy: "user123",
    };

    const mockCreatedRecord = {
      ...maintenanceData,
      actionPerformed: null,
      technician: null,
      createdOn: mockDate,
      medicalEquipmentId: "equip123",
    };

    (prisma.maintenanceHistory.create as jest.Mock).mockResolvedValue(
      mockCreatedRecord,
    );

    // Act
    const result = await repository.createMaintenanceHistory(maintenanceData);

    // Assert
    expect(prisma.maintenanceHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: maintenanceData.id,
        result: maintenanceData.result,
        maintenanceDate: maintenanceData.maintenanceDate,
        createdBy: maintenanceData.createdBy,
        createdOn: mockDate,
        medicalEquipment: {
          connect: {
            id: maintenanceData.medicalEquipmentId,
          },
        },
      }),
    });

    expect(result).toEqual(mockCreatedRecord);
  });

  // Negative case - database error
  it("should throw error when database operation fails", async () => {
    // Arrange
    const maintenanceData = {
      id: "maint123",
      result: "Successful",
      maintenanceDate: new Date("2025-04-28"),
      medicalEquipmentId: "equip123",
      createdBy: "user123",
    };

    const dbError = new Error("Database connection failed");
    (prisma.maintenanceHistory.create as jest.Mock).mockRejectedValue(dbError);

    // Act & Assert
    await expect(
      repository.createMaintenanceHistory(maintenanceData),
    ).rejects.toThrow("Database connection failed");
  });

  // Edge case - date handling
  it("should correctly handle date conversion", async () => {
    // Arrange
    const maintenanceData = {
      id: "maint123",
      result: "Successful",
      // Date as string instead of Date object
      maintenanceDate: "2025-04-28T00:00:00.000Z",
      medicalEquipmentId: "equip123",
      createdBy: "user123",
    };

    const mockCreatedRecord = {
      ...maintenanceData,
      createdOn: mockDate,
      maintenanceDate: new Date("2025-04-28T00:00:00.000Z"),
    };

    (prisma.maintenanceHistory.create as jest.Mock).mockResolvedValue(
      mockCreatedRecord,
    );

    // Act
    const result = await repository.createMaintenanceHistory(maintenanceData);

    // Assert
    expect(prisma.maintenanceHistory.create).toHaveBeenCalled();
    expect(result.maintenanceDate).toEqual(mockCreatedRecord.maintenanceDate);
  });
});
