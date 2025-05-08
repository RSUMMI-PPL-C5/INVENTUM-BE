import MaintenanceHistoryRepository from "../../../../src/repository/maintenance-history.repository";
import prisma from "../../../../src/configs/db.config";
import { MaintenanceHistoryFilterOptions } from "../../../../src/interfaces/maintenance-history.filter.interface";
import { PaginationOptions } from "../../../../src/interfaces/pagination.interface";

// Mock the dependencies
jest.mock("../../../../src/configs/db.config", () => ({
  maintenanceHistory: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
}));

describe("MaintenanceHistoryRepository - getMaintenanceHistories", () => {
  let repository: MaintenanceHistoryRepository;
  const defaultEquipmentId = "equip123"; // Default equipment ID to use in all tests

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new MaintenanceHistoryRepository();
  });

  // Positive case - with required medicalEquipmentId only
  it("should get maintenance histories with just equipment ID", async () => {
    // Arrange
    const filters: MaintenanceHistoryFilterOptions = {
      medicalEquipmentId: defaultEquipmentId,
    };

    const mockHistories = [
      {
        id: "maint1",
        medicalEquipmentId: defaultEquipmentId,
        actionPerformed: "Cleaning",
        result: "Successful",
        maintenanceDate: new Date("2025-04-20"),
        medicalEquipment: { id: defaultEquipmentId, name: "MRI Scanner" },
      },
    ];

    (prisma.maintenanceHistory.findMany as jest.Mock).mockResolvedValue(
      mockHistories,
    );
    (prisma.maintenanceHistory.count as jest.Mock).mockResolvedValue(1);

    // Act
    const result = await repository.getMaintenanceHistories(undefined, filters);

    // Assert
    expect(prisma.maintenanceHistory.findMany).toHaveBeenCalledWith({
      where: { medicalEquipmentId: defaultEquipmentId },
      skip: undefined,
      take: undefined,
      orderBy: { maintenanceDate: "desc" },
    });

    expect(prisma.maintenanceHistory.count).toHaveBeenCalledWith({
      where: { medicalEquipmentId: defaultEquipmentId },
    });

    expect(result).toEqual({
      maintenanceHistories: mockHistories,
      total: 1,
    });
  });

  // Positive case - with search parameter
  it("should search by technician name", async () => {
    // Arrange
    const search = "John";
    const filters: MaintenanceHistoryFilterOptions = {
      medicalEquipmentId: defaultEquipmentId,
    };

    const mockHistories = [
      {
        id: "maint1",
        medicalEquipmentId: defaultEquipmentId,
        technician: "John Doe",
        maintenanceDate: new Date("2025-04-20"),
      },
    ];

    (prisma.maintenanceHistory.findMany as jest.Mock).mockResolvedValue(
      mockHistories,
    );
    (prisma.maintenanceHistory.count as jest.Mock).mockResolvedValue(1);

    // Act
    const result = await repository.getMaintenanceHistories(search, filters);

    // Assert
    expect(prisma.maintenanceHistory.findMany).toHaveBeenCalledWith({
      where: {
        medicalEquipmentId: defaultEquipmentId,
        OR: [{ technician: { contains: "John" } }],
      },
      skip: undefined,
      take: undefined,
      orderBy: { maintenanceDate: "desc" },
    });

    expect(result).toEqual({
      maintenanceHistories: mockHistories,
      total: 1,
    });
  });

  // Positive case - with pagination
  it("should apply pagination correctly", async () => {
    // Arrange
    const filters: MaintenanceHistoryFilterOptions = {
      medicalEquipmentId: defaultEquipmentId,
    };

    const pagination: PaginationOptions = { page: 2, limit: 10 };
    const mockHistories = [
      {
        id: "maint11",
        medicalEquipmentId: defaultEquipmentId,
        result: "Successful",
        maintenanceDate: new Date("2025-03-15"),
      },
    ];

    (prisma.maintenanceHistory.findMany as jest.Mock).mockResolvedValue(
      mockHistories,
    );
    (prisma.maintenanceHistory.count as jest.Mock).mockResolvedValue(15);

    // Act
    const result = await repository.getMaintenanceHistories(
      undefined,
      filters,
      pagination,
    );

    // Assert
    expect(prisma.maintenanceHistory.findMany).toHaveBeenCalledWith({
      where: { medicalEquipmentId: defaultEquipmentId },
      skip: 10, // (page-1) * limit
      take: 10,
      orderBy: { maintenanceDate: "desc" },
    });

    expect(result).toEqual({
      maintenanceHistories: mockHistories,
      total: 15,
    });
  });

  // Positive case - with result filter
  it("should filter by maintenance result", async () => {
    // Arrange
    const filters: MaintenanceHistoryFilterOptions = {
      medicalEquipmentId: defaultEquipmentId,
      result: ["Failed"],
    };

    (prisma.maintenanceHistory.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.maintenanceHistory.count as jest.Mock).mockResolvedValue(0);

    // Act
    await repository.getMaintenanceHistories(undefined, filters);

    // Assert
    expect(prisma.maintenanceHistory.findMany).toHaveBeenCalledWith({
      where: {
        medicalEquipmentId: defaultEquipmentId,
        result: {
          in: ["Failed"],
        },
      },
      skip: undefined,
      take: undefined,
      orderBy: { maintenanceDate: "desc" },
    });
  });

  // Positive case - with technician as a search parameter (now using search instead of filter)
  it("should search by technician name", async () => {
    // Arrange
    const search = "John";
    const filters: MaintenanceHistoryFilterOptions = {
      medicalEquipmentId: defaultEquipmentId,
    };

    (prisma.maintenanceHistory.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.maintenanceHistory.count as jest.Mock).mockResolvedValue(0);

    // Act
    await repository.getMaintenanceHistories(search, filters);

    // Assert
    expect(prisma.maintenanceHistory.findMany).toHaveBeenCalledWith({
      where: {
        medicalEquipmentId: defaultEquipmentId,
        OR: [{ technician: { contains: "John" } }],
      },
      skip: undefined,
      take: undefined,
      orderBy: { maintenanceDate: "desc" },
    });
  });

  // Positive case - with date range filter (start date only)
  it("should filter by maintenance start date only", async () => {
    // Arrange
    const startDate = new Date("2025-01-01");
    const filters: MaintenanceHistoryFilterOptions = {
      medicalEquipmentId: defaultEquipmentId,
      maintenanceDateStart: startDate,
    };

    (prisma.maintenanceHistory.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.maintenanceHistory.count as jest.Mock).mockResolvedValue(0);

    // Act
    await repository.getMaintenanceHistories(undefined, filters);

    // Assert
    expect(prisma.maintenanceHistory.findMany).toHaveBeenCalledWith({
      where: {
        medicalEquipmentId: defaultEquipmentId,
        maintenanceDate: { gte: startDate },
      },
      skip: undefined,
      take: undefined,
      orderBy: { maintenanceDate: "desc" },
    });
  });

  // Positive case - with date range filter (end date only)
  it("should filter by maintenance end date only", async () => {
    // Arrange
    const endDate = new Date("2025-04-30");
    const filters: MaintenanceHistoryFilterOptions = {
      medicalEquipmentId: defaultEquipmentId,
      maintenanceDateEnd: endDate,
    };

    (prisma.maintenanceHistory.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.maintenanceHistory.count as jest.Mock).mockResolvedValue(0);

    // Act
    await repository.getMaintenanceHistories(undefined, filters);

    // Assert
    expect(prisma.maintenanceHistory.findMany).toHaveBeenCalledWith({
      where: {
        medicalEquipmentId: defaultEquipmentId,
        maintenanceDate: { lte: endDate },
      },
      skip: undefined,
      take: undefined,
      orderBy: { maintenanceDate: "desc" },
    });
  });

  // Positive case - with date range filter (both dates)
  it("should filter by maintenance date range (start and end dates)", async () => {
    // Arrange
    const startDate = new Date("2025-01-01");
    const endDate = new Date("2025-04-30");
    const filters: MaintenanceHistoryFilterOptions = {
      medicalEquipmentId: defaultEquipmentId,
      maintenanceDateStart: startDate,
      maintenanceDateEnd: endDate,
    };

    (prisma.maintenanceHistory.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.maintenanceHistory.count as jest.Mock).mockResolvedValue(0);

    // Act
    await repository.getMaintenanceHistories(undefined, filters);

    // Assert
    expect(prisma.maintenanceHistory.findMany).toHaveBeenCalledWith({
      where: {
        medicalEquipmentId: defaultEquipmentId,
        maintenanceDate: { gte: startDate, lte: endDate },
      },
      skip: undefined,
      take: undefined,
      orderBy: { maintenanceDate: "desc" },
    });
  });

  // Positive case - with createdOn filter (start date only)
  it("should filter by createdOn start date only", async () => {
    // Arrange
    const startDate = new Date("2025-01-01");
    const filters: MaintenanceHistoryFilterOptions = {
      medicalEquipmentId: defaultEquipmentId,
      createdOnStart: startDate,
    };

    (prisma.maintenanceHistory.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.maintenanceHistory.count as jest.Mock).mockResolvedValue(0);

    // Act
    await repository.getMaintenanceHistories(undefined, filters);

    // Assert
    expect(prisma.maintenanceHistory.findMany).toHaveBeenCalledWith({
      where: {
        medicalEquipmentId: defaultEquipmentId,
        createdOn: { gte: startDate },
      },
      skip: undefined,
      take: undefined,
      orderBy: { maintenanceDate: "desc" },
    });
  });

  // Positive case - with createdOn filter (end date only)
  it("should filter by createdOn end date only", async () => {
    // Arrange
    const endDate = new Date("2025-04-30");
    const filters: MaintenanceHistoryFilterOptions = {
      medicalEquipmentId: defaultEquipmentId,
      createdOnEnd: endDate,
    };

    (prisma.maintenanceHistory.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.maintenanceHistory.count as jest.Mock).mockResolvedValue(0);

    // Act
    await repository.getMaintenanceHistories(undefined, filters);

    // Assert
    expect(prisma.maintenanceHistory.findMany).toHaveBeenCalledWith({
      where: {
        medicalEquipmentId: defaultEquipmentId,
        createdOn: { lte: endDate },
      },
      skip: undefined,
      take: undefined,
      orderBy: { maintenanceDate: "desc" },
    });
  });

  // Positive case - with createdOn filter (both dates)
  it("should filter by createdOn date range", async () => {
    // Arrange
    const startDate = new Date("2025-01-01");
    const endDate = new Date("2025-04-30");
    const filters: MaintenanceHistoryFilterOptions = {
      medicalEquipmentId: defaultEquipmentId,
      createdOnStart: startDate,
      createdOnEnd: endDate,
    };

    (prisma.maintenanceHistory.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.maintenanceHistory.count as jest.Mock).mockResolvedValue(0);

    // Act
    await repository.getMaintenanceHistories(undefined, filters);

    // Assert
    expect(prisma.maintenanceHistory.findMany).toHaveBeenCalledWith({
      where: {
        medicalEquipmentId: defaultEquipmentId,
        createdOn: { gte: startDate, lte: endDate },
      },
      skip: undefined,
      take: undefined,
      orderBy: { maintenanceDate: "desc" },
    });
  });

  // Positive case - with multiple filters combined
  it("should combine search and multiple filters correctly", async () => {
    // Arrange
    const search = "John";
    const startDate = new Date("2025-01-01");
    const endDate = new Date("2025-04-30");
    const createdStartDate = new Date("2025-02-01");
    const createdEndDate = new Date("2025-03-01");

    const filters: MaintenanceHistoryFilterOptions = {
      medicalEquipmentId: defaultEquipmentId,
      result: ["Success"],
      maintenanceDateStart: startDate,
      maintenanceDateEnd: endDate,
      createdOnStart: createdStartDate,
      createdOnEnd: createdEndDate,
    };

    (prisma.maintenanceHistory.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.maintenanceHistory.count as jest.Mock).mockResolvedValue(0);

    // Act
    await repository.getMaintenanceHistories(search, filters);

    // Assert
    expect(prisma.maintenanceHistory.findMany).toHaveBeenCalledWith({
      where: {
        medicalEquipmentId: defaultEquipmentId,
        result: {
          in: ["Success"],
        },
        maintenanceDate: { gte: startDate, lte: endDate },
        createdOn: { gte: createdStartDate, lte: createdEndDate },
        OR: [{ technician: { contains: "John" } }],
      },
      skip: undefined,
      take: undefined,
      orderBy: { maintenanceDate: "desc" },
    });
  });

  // Negative case - database error
  it("should throw error when database query fails", async () => {
    // Arrange
    const filters: MaintenanceHistoryFilterOptions = {
      medicalEquipmentId: defaultEquipmentId,
    };

    const dbError = new Error("Database connection failed");
    (prisma.maintenanceHistory.findMany as jest.Mock).mockRejectedValue(
      dbError,
    );

    // Act & Assert
    await expect(
      repository.getMaintenanceHistories(undefined, filters),
    ).rejects.toThrow("Database connection failed");
  });

  // Edge case - no filters but with search
  it("should handle search without filters", async () => {
    // Arrange
    const search = "John";

    const mockHistories = [
      {
        id: "maint1",
        technician: "John Doe",
        maintenanceDate: new Date("2025-04-20"),
      },
    ];

    (prisma.maintenanceHistory.findMany as jest.Mock).mockResolvedValue(
      mockHistories,
    );
    (prisma.maintenanceHistory.count as jest.Mock).mockResolvedValue(1);

    // Act
    const result = await repository.getMaintenanceHistories(search);

    // Assert
    expect(prisma.maintenanceHistory.findMany).toHaveBeenCalledWith({
      where: {
        OR: [{ technician: { contains: "John" } }],
      },
      skip: undefined,
      take: undefined,
      orderBy: { maintenanceDate: "desc" },
    });

    expect(result).toEqual({
      maintenanceHistories: mockHistories,
      total: 1,
    });
  });

  // Edge case - empty string search
  it("should ignore empty search string", async () => {
    // Arrange
    const search = "";
    const filters: MaintenanceHistoryFilterOptions = {
      medicalEquipmentId: defaultEquipmentId,
    };

    (prisma.maintenanceHistory.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.maintenanceHistory.count as jest.Mock).mockResolvedValue(0);

    // Act
    await repository.getMaintenanceHistories(search, filters);

    // Assert
    expect(prisma.maintenanceHistory.findMany).toHaveBeenCalledWith({
      where: {
        medicalEquipmentId: defaultEquipmentId,
      },
      skip: undefined,
      take: undefined,
      orderBy: { maintenanceDate: "desc" },
    });
  });

  // Edge case - invalid date objects
  it("should handle invalid date objects in filters", async () => {
    // Arrange
    const invalidDate = new Date("invalid-date"); // Will be Invalid Date
    const filters: MaintenanceHistoryFilterOptions = {
      medicalEquipmentId: defaultEquipmentId,
      maintenanceDateStart: invalidDate,
      maintenanceDateEnd: invalidDate,
      createdOnStart: invalidDate,
      createdOnEnd: invalidDate,
    };

    (prisma.maintenanceHistory.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.maintenanceHistory.count as jest.Mock).mockResolvedValue(0);

    // Act
    await repository.getMaintenanceHistories(undefined, filters);

    // Assert
    expect(prisma.maintenanceHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          medicalEquipmentId: defaultEquipmentId,
        }),
      }),
    );
  });
});
