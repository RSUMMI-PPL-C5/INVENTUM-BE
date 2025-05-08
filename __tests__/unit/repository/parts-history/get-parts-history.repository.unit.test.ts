import PartsHistoryRepository from "../../../../src/repository/parts-history.repository";

// Mock the imports
jest.mock("@prisma/client");
jest.mock("../../../../src/configs/db.config", () => ({
  __esModule: true,
  default: {
    partsHistory: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe("PartsHistoryRepository - getPartsHistories", () => {
  let partsHistoryRepository: PartsHistoryRepository;
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    partsHistoryRepository = new PartsHistoryRepository();
    mockPrisma = require("../../../../src/configs/db.config").default;
  });

  // Positive test case - default query
  it("should get parts histories without any filters or pagination", async () => {
    // Arrange
    const mockPartsHistories = [
      {
        id: "ph-123",
        actionPerformed: "Replace motor",
        technician: "John Doe",
        result: "Success",
        replacementDate: new Date("2023-05-10"),
        createdBy: "user-123",
        createdOn: new Date("2023-05-15"),
        medicalEquipmentId: "equip-123",
        sparepartId: "sp-123",
        sparepart: { partsName: "Motor" },
      },
    ];

    const expectedResult = [
      {
        id: "ph-123",
        actionPerformed: "Replace motor",
        technician: "John Doe",
        result: "Success",
        replacementDate: new Date("2023-05-10"),
        createdBy: "user-123",
        createdOn: new Date("2023-05-15"),
        medicalEquipmentId: "equip-123",
        sparepartId: "sp-123",
        partsName: "Motor",
      },
    ];

    mockPrisma.partsHistory.findMany.mockResolvedValueOnce(mockPartsHistories);
    mockPrisma.partsHistory.count.mockResolvedValueOnce(1);

    // Act
    const result = await partsHistoryRepository.getPartsHistories();

    // Assert
    expect(mockPrisma.partsHistory.findMany).toHaveBeenCalledWith({
      where: {},
      skip: undefined,
      take: undefined,
      orderBy: {
        replacementDate: "desc",
      },
      include: {
        sparepart: {
          select: {
            partsName: true,
          },
        },
      },
    });

    expect(mockPrisma.partsHistory.count).toHaveBeenCalledWith({ where: {} });
    expect(result).toEqual({ partsHistories: expectedResult, total: 1 });
  });

  // Positive test case - search query
  it("should get parts histories with search query", async () => {
    // Arrange
    const search = "motor";
    mockPrisma.partsHistory.findMany.mockResolvedValueOnce([]);
    mockPrisma.partsHistory.count.mockResolvedValueOnce(0);

    // Act
    await partsHistoryRepository.getPartsHistories(search);

    // Assert
    expect(mockPrisma.partsHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [{ technician: { contains: "motor" } }],
        },
      }),
    );
  });

  // Positive test case - filter by equipment ID
  it("should get parts histories filtered by equipment ID", async () => {
    // Arrange
    const filters = { medicalEquipmentId: "equip-123" };
    mockPrisma.partsHistory.findMany.mockResolvedValueOnce([]);
    mockPrisma.partsHistory.count.mockResolvedValueOnce(0);

    // Act
    await partsHistoryRepository.getPartsHistories(undefined, filters);

    // Assert
    expect(mockPrisma.partsHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { medicalEquipmentId: "equip-123" },
      }),
    );
  });

  // Positive test case - filter by date range
  it("should get parts histories filtered by replacement date range", async () => {
    // Arrange
    const startDate = new Date("2023-01-01");
    const endDate = new Date("2023-12-31");
    const filters = {
      replacementDateStart: startDate,
      replacementDateEnd: endDate,
    };

    mockPrisma.partsHistory.findMany.mockResolvedValueOnce([]);
    mockPrisma.partsHistory.count.mockResolvedValueOnce(0);

    // Act
    await partsHistoryRepository.getPartsHistories(undefined, filters);

    // Assert
    expect(mockPrisma.partsHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          replacementDate: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
    );
  });

  // Positive test case - pagination
  it("should get parts histories with pagination", async () => {
    // Arrange
    const pagination = { page: 2, limit: 10 };
    mockPrisma.partsHistory.findMany.mockResolvedValueOnce([]);
    mockPrisma.partsHistory.count.mockResolvedValueOnce(25);

    // Act
    const result = await partsHistoryRepository.getPartsHistories(
      undefined,
      undefined,
      pagination,
    );

    // Assert
    expect(mockPrisma.partsHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10, // (page-1) * limit
        take: 10,
      }),
    );

    expect(result.total).toBe(25);
  });

  // Negative test case
  it("should throw an error when database operation fails", async () => {
    // Arrange
    const mockError = new Error("Database query failed");
    mockPrisma.partsHistory.findMany.mockRejectedValueOnce(mockError);

    // Act & Assert
    await expect(partsHistoryRepository.getPartsHistories()).rejects.toThrow(
      "Database query failed",
    );
  });

  // Edge case - empty result set
  it("should handle empty result set", async () => {
    // Arrange
    mockPrisma.partsHistory.findMany.mockResolvedValueOnce([]);
    mockPrisma.partsHistory.count.mockResolvedValueOnce(0);

    // Act
    const result = await partsHistoryRepository.getPartsHistories();

    // Assert
    expect(result).toEqual({ partsHistories: [], total: 0 });
  });

  // Edge case - complex filter combinations
  it("should handle complex filter combinations", async () => {
    // Arrange
    const search = "motor";
    const filters = {
      medicalEquipmentId: "equip-123",
      sparepartId: "sp-456",
      result: ["Success"],
      replacementDateStart: new Date("2023-01-01"),
      replacementDateEnd: new Date("2023-12-31"),
      createdOnStart: new Date("2023-01-01"),
      createdOnEnd: new Date("2023-12-31"),
    };
    const pagination = { page: 3, limit: 5 };

    mockPrisma.partsHistory.findMany.mockResolvedValueOnce([]);
    mockPrisma.partsHistory.count.mockResolvedValueOnce(0);

    // Act
    await partsHistoryRepository.getPartsHistories(search, filters, pagination);

    // Assert
    expect(mockPrisma.partsHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.any(Array),
          medicalEquipmentId: "equip-123",
          sparepartId: "sp-456",
          result: {
            in: ["Success"],
          },
          replacementDate: expect.any(Object),
          createdOn: expect.any(Object),
        }),
        skip: 10, // (3-1) * 5
        take: 5,
      }),
    );
  });
});
