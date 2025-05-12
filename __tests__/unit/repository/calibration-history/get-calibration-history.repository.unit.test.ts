import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";
import CalibrationHistoryRepository from "../../../../src/repository/calibration-history.repository";
import prisma from "../../../../src/configs/db.config";

// Mock the Prisma client
jest.mock("../../../../src/configs/db.config", () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe("CalibrationHistoryRepository - getCalibrationHistories", () => {
  let repository: CalibrationHistoryRepository;

  beforeEach(() => {
    mockReset(prismaMock);
    repository = new CalibrationHistoryRepository();
  });

  // Sample data
  const sampleCalibrationHistories = [
    {
      id: "cal1",
      medicalEquipmentId: "equip1",
      actionPerformed: "Annual calibration",
      technician: "John Doe",
      result: "Success",
      calibrationDate: new Date("2025-04-15"),
      calibrationMethod: "Standard reference",
      nextCalibrationDue: new Date("2026-04-15"),
      createdBy: "admin",
      createdOn: new Date("2025-04-15"),
    },
    {
      id: "cal2",
      medicalEquipmentId: "equip1",
      actionPerformed: "Emergency calibration",
      technician: "Jane Smith",
      result: "Partial",
      calibrationDate: new Date("2025-03-10"),
      calibrationMethod: "Manual calibration",
      nextCalibrationDue: null,
      createdBy: "admin",
      createdOn: new Date("2025-03-10"),
    },
  ];

  // Positive case - get all without filters or pagination
  it("should retrieve all calibration histories without filters", async () => {
    // Arrange
    prismaMock.calibrationHistory.findMany.mockResolvedValue(
      sampleCalibrationHistories,
    );
    prismaMock.calibrationHistory.count.mockResolvedValue(
      sampleCalibrationHistories.length,
    );

    // Act
    const result = await repository.getCalibrationHistories();

    // Assert
    expect(prismaMock.calibrationHistory.findMany).toHaveBeenCalledWith({
      where: {},
      skip: undefined,
      take: undefined,
      orderBy: { calibrationDate: "desc" },
    });
    expect(result.calibrationHistories).toEqual(sampleCalibrationHistories);
    expect(result.total).toBe(2);
  });

  // Positive case - with search parameter
  it("should apply search parameter correctly", async () => {
    // Arrange
    const search = "John";
    const filteredHistories = [sampleCalibrationHistories[0]];

    prismaMock.calibrationHistory.findMany.mockResolvedValue(filteredHistories);
    prismaMock.calibrationHistory.count.mockResolvedValue(
      filteredHistories.length,
    );

    // Act
    const result = await repository.getCalibrationHistories(search);

    // Assert
    expect(prismaMock.calibrationHistory.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { technician: { contains: "John" } },
          { calibrationMethod: { contains: "John" } },
        ],
      },
      skip: undefined,
      take: undefined,
      orderBy: { calibrationDate: "desc" },
    });
    expect(result.calibrationHistories).toEqual(filteredHistories);
    expect(result.total).toBe(1);
  });

  // Positive case - with filters
  it("should apply filters correctly", async () => {
    // Arrange
    const filters = {
      medicalEquipmentId: "equip1",
      result: ["Success"],
    };

    const filteredHistories = [sampleCalibrationHistories[0]];

    prismaMock.calibrationHistory.findMany.mockResolvedValue(filteredHistories);
    prismaMock.calibrationHistory.count.mockResolvedValue(
      filteredHistories.length,
    );

    // Act
    const result = await repository.getCalibrationHistories(undefined, filters);

    // Assert
    expect(prismaMock.calibrationHistory.findMany).toHaveBeenCalledWith({
      where: {
        medicalEquipmentId: "equip1",
        result: {
          in: ["Success"],
        },
      },
      skip: undefined,
      take: undefined,
      orderBy: { calibrationDate: "desc" },
    });
    expect(result.total).toBe(1);
  });

  // Positive case - with pagination
  it("should apply pagination correctly", async () => {
    // Arrange
    const pagination = { page: 2, limit: 10 };

    prismaMock.calibrationHistory.findMany.mockResolvedValue([
      sampleCalibrationHistories[1],
    ]);
    prismaMock.calibrationHistory.count.mockResolvedValue(15); // 15 total records

    // Act
    const result = await repository.getCalibrationHistories(
      undefined,
      undefined,
      pagination,
    );

    // Assert
    expect(prismaMock.calibrationHistory.findMany).toHaveBeenCalledWith({
      where: {},
      skip: 10, // (page-1) * limit
      take: 10,
      orderBy: { calibrationDate: "desc" },
    });
    expect(result.total).toBe(15);
  });

  // Positive case - with date range filters
  it("should apply date range filters correctly", async () => {
    // Arrange
    const dateStart = new Date("2025-01-01");
    const dateEnd = new Date("2025-06-30");

    const filters = {
      calibrationDateStart: dateStart,
      calibrationDateEnd: dateEnd,
    };

    prismaMock.calibrationHistory.findMany.mockResolvedValue(
      sampleCalibrationHistories,
    );
    prismaMock.calibrationHistory.count.mockResolvedValue(2);

    // Act
    await repository.getCalibrationHistories(undefined, filters);

    // Assert
    expect(prismaMock.calibrationHistory.findMany).toHaveBeenCalledWith({
      where: {
        calibrationDate: {
          gte: dateStart,
          lte: dateEnd,
        },
      },
      skip: undefined,
      take: undefined,
      orderBy: { calibrationDate: "desc" },
    });
  });

  // Positive case - with nextCalibrationDueBefore filter
  it("should apply nextCalibrationDueBefore filter correctly", async () => {
    // Arrange
    const nextDueDate = new Date("2026-01-01");

    const filters = {
      nextCalibrationDueBefore: nextDueDate,
    };

    prismaMock.calibrationHistory.findMany.mockResolvedValue([
      sampleCalibrationHistories[0],
    ]);
    prismaMock.calibrationHistory.count.mockResolvedValue(1);

    // Act
    await repository.getCalibrationHistories(undefined, filters);

    // Assert
    expect(prismaMock.calibrationHistory.findMany).toHaveBeenCalledWith({
      where: {
        nextCalibrationDue: {
          lte: nextDueDate,
          not: null,
        },
      },
      skip: undefined,
      take: undefined,
      orderBy: { calibrationDate: "desc" },
    });
  });

  // Positive case - with createdOn date range filters
  it("should apply createdOn date range filters correctly", async () => {
    // Arrange
    const createdOnStart = new Date("2025-01-01");
    const createdOnEnd = new Date("2025-06-30");

    const filters = {
      createdOnStart,
      createdOnEnd,
    };

    prismaMock.calibrationHistory.findMany.mockResolvedValue(
      sampleCalibrationHistories,
    );
    prismaMock.calibrationHistory.count.mockResolvedValue(2);

    // Act
    await repository.getCalibrationHistories(undefined, filters);

    // Assert
    expect(prismaMock.calibrationHistory.findMany).toHaveBeenCalledWith({
      where: {
        createdOn: {
          gte: createdOnStart,
          lte: createdOnEnd,
        },
      },
      skip: undefined,
      take: undefined,
      orderBy: { calibrationDate: "desc" },
    });
  });

  // Positive case - with calibrationMethod filter
  it("should apply calibrationMethod filter correctly", async () => {
    // Arrange
    const filters = {
      calibrationMethod: "Standard",
    };

    prismaMock.calibrationHistory.findMany.mockResolvedValue([
      sampleCalibrationHistories[0],
    ]);
    prismaMock.calibrationHistory.count.mockResolvedValue(1);

    // Act
    await repository.getCalibrationHistories(undefined, filters);

    // Assert
    expect(prismaMock.calibrationHistory.findMany).toHaveBeenCalledWith({
      where: {
        calibrationMethod: {
          contains: "Standard",
        },
      },
      skip: undefined,
      take: undefined,
      orderBy: { calibrationDate: "desc" },
    });
  });

  // Positive case - multiple filters combined
  it("should apply multiple filters correctly", async () => {
    // Arrange
    const filters = {
      medicalEquipmentId: "equip1",
      result: ["Success"],
      calibrationDateStart: new Date("2025-01-01"),
      calibrationDateEnd: new Date("2025-12-31"),
    };

    prismaMock.calibrationHistory.findMany.mockResolvedValue([
      sampleCalibrationHistories[0],
    ]);
    prismaMock.calibrationHistory.count.mockResolvedValue(1);

    // Act
    await repository.getCalibrationHistories(undefined, filters);

    // Assert
    expect(prismaMock.calibrationHistory.findMany).toHaveBeenCalledWith({
      where: {
        medicalEquipmentId: "equip1",
        result: {
          in: ["Success"],
        },
        calibrationDate: {
          gte: filters.calibrationDateStart,
          lte: filters.calibrationDateEnd,
        },
      },
      skip: undefined,
      take: undefined,
      orderBy: { calibrationDate: "desc" },
    });
  });

  // Negative case - handle database error
  it("should throw an error when database operation fails", async () => {
    // Arrange
    const dbError = new Error("Database connection error");
    prismaMock.calibrationHistory.findMany.mockRejectedValue(dbError);

    // Act & Assert
    await expect(repository.getCalibrationHistories()).rejects.toThrow(
      "Database connection error",
    );
  });

  // Edge case - empty results
  it("should handle empty results", async () => {
    // Arrange
    prismaMock.calibrationHistory.findMany.mockResolvedValue([]);
    prismaMock.calibrationHistory.count.mockResolvedValue(0);

    // Act
    const result = await repository.getCalibrationHistories();

    // Assert
    expect(result.calibrationHistories).toEqual([]);
    expect(result.total).toBe(0);
  });

  // Edge case - search with zero matching results
  it("should handle search with no matching results", async () => {
    // Arrange
    const search = "NonExistentTechnician";

    prismaMock.calibrationHistory.findMany.mockResolvedValue([]);
    prismaMock.calibrationHistory.count.mockResolvedValue(0);

    // Act
    const result = await repository.getCalibrationHistories(search);

    // Assert
    expect(result.calibrationHistories).toEqual([]);
    expect(result.total).toBe(0);
  });

  // Edge case - large page number with no results
  it("should handle large page number with no results", async () => {
    // Arrange
    const pagination = { page: 100, limit: 10 };

    prismaMock.calibrationHistory.findMany.mockResolvedValue([]);
    prismaMock.calibrationHistory.count.mockResolvedValue(50); // Only 50 records total

    // Act
    const result = await repository.getCalibrationHistories(
      undefined,
      undefined,
      pagination,
    );

    // Assert
    expect(prismaMock.calibrationHistory.findMany).toHaveBeenCalledWith({
      where: {},
      skip: 990, // (page-1) * limit
      take: 10,
      orderBy: { calibrationDate: "desc" },
    });
    expect(result.calibrationHistories).toEqual([]);
    expect(result.total).toBe(50);
  });

  // Edge case - search and filters combined
  it("should combine search and filters correctly", async () => {
    // Arrange
    const search = "Standard";
    const filters = {
      result: ["Success"],
    };

    prismaMock.calibrationHistory.findMany.mockResolvedValue([
      sampleCalibrationHistories[0],
    ]);
    prismaMock.calibrationHistory.count.mockResolvedValue(1);

    // Act
    await repository.getCalibrationHistories(search, filters);

    // Assert
    expect(prismaMock.calibrationHistory.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { technician: { contains: "Standard" } },
          { calibrationMethod: { contains: "Standard" } },
        ],
        result: {
          in: ["Success"],
        },
      },
      skip: undefined,
      take: undefined,
      orderBy: { calibrationDate: "desc" },
    });
  });
});
