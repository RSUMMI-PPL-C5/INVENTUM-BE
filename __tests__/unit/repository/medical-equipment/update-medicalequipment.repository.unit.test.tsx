import MedicalEquipmentRepository from "../../../../src/repository/medical-equipment.repository";
import { getJakartaTime } from "../../../../src/utils/date.utils";

// Mock Prisma
jest.mock("@prisma/client", () => {
  const mockPrismaClient = {
    medicalEquipment: {
      findFirst: jest.fn(),
      update: jest.fn(),
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

describe("MedicalEquipmentRepository - updateMedicalEquipment", () => {
  let medicalEquipmentRepository: MedicalEquipmentRepository;
  let mockPrisma: any;
  const mockCurrentDate = new Date("2025-04-21T10:00:00Z");

  beforeEach(() => {
    jest.clearAllMocks();
    medicalEquipmentRepository = new MedicalEquipmentRepository();
    mockPrisma = (medicalEquipmentRepository as any).prisma;
    (getJakartaTime as jest.Mock).mockReturnValue(mockCurrentDate);
  });

  it("should successfully update a medical equipment", async () => {
    // Arrange
    const equipmentId = "test-equipment-id";
    const updateData = {
      name: "Updated Equipment",
      status: "Maintenance",
      modifiedBy: "user-123",
    };

    const originalEquipment = {
      id: equipmentId,
      name: "Original Equipment",
      inventorisId: "INV001",
      status: "Active",
      brandName: "Brand",
      modelName: "Model",
      deletedOn: null,
    };

    const updatedEquipment = {
      id: equipmentId,
      name: "Updated Equipment",
      inventorisId: "INV001",
      status: "Maintenance",
      brandName: "Brand",
      modelName: "Model",
      modifiedBy: "user-123",
      modifiedOn: mockCurrentDate,
    };

    mockPrisma.medicalEquipment.findFirst.mockResolvedValue(originalEquipment);
    mockPrisma.medicalEquipment.update.mockResolvedValue(updatedEquipment);

    // Act
    const result = await medicalEquipmentRepository.updateMedicalEquipment(
      equipmentId,
      updateData,
    );

    // Assert
    expect(mockPrisma.medicalEquipment.findFirst).toHaveBeenCalledWith({
      where: { id: equipmentId, deletedOn: null },
    });

    expect(mockPrisma.medicalEquipment.update).toHaveBeenCalledWith({
      where: { id: equipmentId },
      data: {
        ...updateData,
        modifiedOn: mockCurrentDate,
      },
      select: {
        id: true,
        inventorisId: true,
        name: true,
        brandName: true,
        modelName: true,
        modifiedBy: true,
        modifiedOn: true,
      },
    });

    expect(result).toEqual(updatedEquipment);
  });

  it("should return null if equipment not found", async () => {
    // Arrange
    const equipmentId = "non-existent-id";
    const updateData = { name: "Updated Name" };

    mockPrisma.medicalEquipment.findFirst.mockResolvedValue(null);

    // Act
    const result = await medicalEquipmentRepository.updateMedicalEquipment(
      equipmentId,
      updateData,
    );

    // Assert
    expect(mockPrisma.medicalEquipment.findFirst).toHaveBeenCalledWith({
      where: { id: equipmentId, deletedOn: null },
    });
    expect(mockPrisma.medicalEquipment.update).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it("should convert null brandName and modelName to undefined", async () => {
    // Arrange
    const equipmentId = "test-equipment-id";
    const updateData = { name: "Updated Equipment" };

    const originalEquipment = {
      id: equipmentId,
      name: "Original Equipment",
      inventorisId: "INV001",
      deletedOn: null,
    };

    const updatedEquipment = {
      id: equipmentId,
      name: "Updated Equipment",
      inventorisId: "INV001",
      brandName: null,
      modelName: null,
      modifiedBy: null,
      modifiedOn: mockCurrentDate,
    };

    mockPrisma.medicalEquipment.findFirst.mockResolvedValue(originalEquipment);
    mockPrisma.medicalEquipment.update.mockResolvedValue(updatedEquipment);

    // Act
    const result = await medicalEquipmentRepository.updateMedicalEquipment(
      equipmentId,
      updateData,
    );

    // Assert
    expect(result).toEqual({
      ...updatedEquipment,
      brandName: undefined,
      modelName: undefined,
    });
  });
});
