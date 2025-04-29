import PartsHistoryRepository from "../../../../src/repository/parts-history.repository";
import { getJakartaTime } from "../../../../src/utils/date.utils";

// Mock the imports
jest.mock("@prisma/client");
jest.mock("../../../../src/configs/db.config", () => ({
  __esModule: true,
  default: {
    partsHistory: {
      create: jest.fn(),
    },
  },
}));
jest.mock("../../../../src/utils/date.utils", () => ({
  getJakartaTime: jest.fn().mockReturnValue(new Date("2023-05-15T12:00:00Z")),
}));

describe("PartsHistoryRepository - createPartsHistory", () => {
  let partsHistoryRepository: PartsHistoryRepository;
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    partsHistoryRepository = new PartsHistoryRepository();
    mockPrisma = require("../../../../src/configs/db.config").default;
  });

  // Positive test case
  it("should successfully create a parts history record", async () => {
    // Arrange
    const mockPartsData = {
      id: "ph-123",
      actionPerformed: "Replace motor",
      technician: "John Doe",
      result: "Success",
      replacementDate: new Date("2023-05-10"),
      createdBy: "user-123",
      medicalEquipmentId: "equip-123",
      sparepartId: "sp-123",
    };

    const mockCreatedRecord = {
      id: "ph-123",
      actionPerformed: "Replace motor",
      technician: "John Doe",
      result: "Success",
      replacementDate: new Date("2023-05-10"),
      createdBy: "user-123",
      createdOn: getJakartaTime(),
      medicalEquipmentId: "equip-123",
      sparepartId: "sp-123",
    };

    mockPrisma.partsHistory.create.mockResolvedValueOnce(mockCreatedRecord);

    // Act
    const result =
      await partsHistoryRepository.createPartsHistory(mockPartsData);

    // Assert
    expect(mockPrisma.partsHistory.create).toHaveBeenCalledWith({
      data: {
        id: mockPartsData.id,
        actionPerformed: mockPartsData.actionPerformed,
        technician: mockPartsData.technician,
        result: mockPartsData.result,
        replacementDate: mockPartsData.replacementDate,
        createdBy: mockPartsData.createdBy,
        createdOn: getJakartaTime(),
        equipment: {
          connect: {
            id: mockPartsData.medicalEquipmentId,
          },
        },
        sparepart: {
          connect: {
            id: mockPartsData.sparepartId,
          },
        },
      },
    });

    expect(result).toEqual(mockCreatedRecord);
  });

  // Negative test case
  it("should throw an error when database operation fails", async () => {
    // Arrange
    const mockPartsData = {
      id: "ph-123",
      actionPerformed: "Replace motor",
      technician: "John Doe",
      result: "Success",
      replacementDate: new Date("2023-05-10"),
      createdBy: "user-123",
      medicalEquipmentId: "equip-123",
      sparepartId: "sp-123",
    };

    const mockError = new Error("Database connection failed");
    mockPrisma.partsHistory.create.mockRejectedValueOnce(mockError);

    // Act & Assert
    await expect(
      partsHistoryRepository.createPartsHistory(mockPartsData),
    ).rejects.toThrow("Database connection failed");
  });

  // Edge case - minimal required data
  it("should create a record with minimal required data", async () => {
    // Arrange
    const minimalPartsData = {
      id: "ph-123",
      actionPerformed: "", // Empty string
      technician: "", // Empty string
      result: "Success",
      replacementDate: new Date("2023-05-10"),
      createdBy: "user-123",
      medicalEquipmentId: "equip-123",
      sparepartId: "sp-123",
    };

    mockPrisma.partsHistory.create.mockResolvedValueOnce({
      ...minimalPartsData,
      createdOn: getJakartaTime(),
    });

    // Act
    const result =
      await partsHistoryRepository.createPartsHistory(minimalPartsData);

    // Assert
    expect(mockPrisma.partsHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          actionPerformed: "",
          technician: "",
        }),
      }),
    );
    expect(result).toBeDefined();
  });
});
