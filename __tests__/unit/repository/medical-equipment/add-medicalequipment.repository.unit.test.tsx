import MedicalEquipmentRepository from "../../../../src/repository/medical-equipment.repository";
import { getJakartaTime } from "../../../../src/utils/date.utils";

// Mock Prisma
jest.mock("@prisma/client", () => {
  const mockPrismaClient = {
    medicalEquipment: {
      create: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

// Mock getJakartaTime
jest.mock("../../../../src/utils/date.utils", () => ({
  getJakartaTime: jest.fn(),
}));

describe("MedicalEquipmentRepository - addMedicalEquipment", () => {
  let medicalEquipmentRepository: MedicalEquipmentRepository;
  let mockPrisma: any;
  const mockCurrentDate = new Date("2025-04-21T10:00:00Z");

  beforeEach(() => {
    jest.clearAllMocks();
    medicalEquipmentRepository = new MedicalEquipmentRepository();
    mockPrisma = (medicalEquipmentRepository as any).prisma;
    (getJakartaTime as jest.Mock).mockReturnValue(mockCurrentDate);
  });

  it("should successfully create a medical equipment with required fields", async () => {
    // Arrange
    const equipmentData = {
      id: "test-id",
      inventorisId: "INV001",
      name: "Test Equipment",
      status: "Active",
      createdBy: "user-123",
    };

    const createdEquipment = {
      id: "test-id",
      inventorisId: "INV001",
      name: "Test Equipment",
      status: "Active",
      brandName: null,
      modelName: null,
      createdBy: "user-123",
      createdOn: mockCurrentDate,
    };

    mockPrisma.medicalEquipment.create.mockResolvedValue(createdEquipment);

    // Act
    const result =
      await medicalEquipmentRepository.addMedicalEquipment(equipmentData);

    // Assert
    expect(mockPrisma.medicalEquipment.create).toHaveBeenCalledWith({
      data: {
        ...equipmentData,
        createdOn: mockCurrentDate,
        modifiedOn: mockCurrentDate,
      },
      select: {
        id: true,
        inventorisId: true,
        name: true,
        brandName: true,
        modelName: true,
        createdBy: true,
        createdOn: true,
      },
    });

    expect(result).toEqual({
      ...createdEquipment,
      brandName: undefined,
      modelName: undefined,
    });
  });

  it("should create equipment with all fields provided", async () => {
    // Arrange
    const equipmentData = {
      id: "test-id-2",
      inventorisId: "INV002",
      name: "Full Equipment",
      brandName: "Test Brand",
      modelName: "Test Model",
      status: "Active",
      purchaseDate: new Date("2025-01-01"),
      purchasePrice: 5000,
      vendor: "Test Vendor",
      createdBy: "user-123",
    };

    const createdEquipment = {
      ...equipmentData,
      createdOn: mockCurrentDate,
    };

    mockPrisma.medicalEquipment.create.mockResolvedValue(createdEquipment);

    // Act
    const result =
      await medicalEquipmentRepository.addMedicalEquipment(equipmentData);

    // Assert
    expect(mockPrisma.medicalEquipment.create).toHaveBeenCalledWith({
      data: {
        ...equipmentData,
        createdOn: mockCurrentDate,
        modifiedOn: mockCurrentDate,
      },
      select: expect.objectContaining({
        id: true,
        inventorisId: true,
        name: true,
        brandName: true,
        modelName: true,
      }),
    });

    expect(result).toEqual(createdEquipment);
  });

  it("should handle database errors when creating equipment", async () => {
    // Arrange
    const equipmentData = {
      id: "test-id",
      inventorisId: "INV003",
      name: "Error Equipment",
      createdBy: "user-123",
    };

    const dbError = new Error("Database connection error");
    mockPrisma.medicalEquipment.create.mockRejectedValue(dbError);

    // Act & Assert
    await expect(
      medicalEquipmentRepository.addMedicalEquipment(equipmentData),
    ).rejects.toThrow("Database connection error");

    expect(mockPrisma.medicalEquipment.create).toHaveBeenCalledWith({
      data: {
        ...equipmentData,
        createdOn: mockCurrentDate,
        modifiedOn: mockCurrentDate,
      },
      select: expect.any(Object),
    });
  });
});
