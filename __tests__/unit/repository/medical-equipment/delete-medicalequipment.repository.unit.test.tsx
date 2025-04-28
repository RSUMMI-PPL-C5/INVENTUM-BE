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

describe("MedicalEquipmentRepository - deleteMedicalEquipment", () => {
  let medicalEquipmentRepository: MedicalEquipmentRepository;
  let mockPrisma: any;
  const mockCurrentDate = new Date("2025-04-21T10:00:00Z");

  beforeEach(() => {
    jest.clearAllMocks();
    medicalEquipmentRepository = new MedicalEquipmentRepository();
    mockPrisma = (medicalEquipmentRepository as any).prisma;
    (getJakartaTime as jest.Mock).mockReturnValue(mockCurrentDate);
  });

  it("should successfully delete a medical equipment", async () => {
    // Arrange
    const equipmentId = "test-equipment-id";
    const deletedById = "user-123";

    const mockEquipment = {
      id: equipmentId,
      name: "Test Equipment",
      inventorisId: "INV001",
      status: "Active",
      deletedOn: null,
    };

    mockPrisma.medicalEquipment.findFirst.mockResolvedValue(mockEquipment);
    mockPrisma.medicalEquipment.update.mockResolvedValue({
      ...mockEquipment,
      deletedOn: mockCurrentDate,
      deletedBy: deletedById,
    });

    // Act
    const result = await medicalEquipmentRepository.deleteMedicalEquipment(
      equipmentId,
      deletedById,
    );

    // Assert
    expect(mockPrisma.medicalEquipment.findFirst).toHaveBeenCalledWith({
      where: { id: equipmentId, deletedOn: null },
    });

    expect(mockPrisma.medicalEquipment.update).toHaveBeenCalledWith({
      where: { id: equipmentId },
      data: {
        deletedOn: mockCurrentDate,
        deletedBy: deletedById,
      },
    });

    expect(result).toEqual({
      ...mockEquipment,
      deletedOn: mockCurrentDate,
      deletedBy: deletedById,
    });
  });

  it("should return null if equipment not found", async () => {
    // Arrange
    const equipmentId = "non-existent-id";
    mockPrisma.medicalEquipment.findFirst.mockResolvedValue(null);

    // Act
    const result =
      await medicalEquipmentRepository.deleteMedicalEquipment(equipmentId);

    // Assert
    expect(mockPrisma.medicalEquipment.findFirst).toHaveBeenCalledWith({
      where: { id: equipmentId, deletedOn: null },
    });
    expect(mockPrisma.medicalEquipment.update).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it("should delete without deletedBy if not provided", async () => {
    // Arrange
    const equipmentId = "test-equipment-id";

    const mockEquipment = {
      id: equipmentId,
      name: "Test Equipment",
      inventorisId: "INV001",
      status: "Active",
      deletedOn: null,
    };

    mockPrisma.medicalEquipment.findFirst.mockResolvedValue(mockEquipment);
    mockPrisma.medicalEquipment.update.mockResolvedValue({
      ...mockEquipment,
      deletedOn: mockCurrentDate,
      deletedBy: undefined,
    });

    // Act
    const result =
      await medicalEquipmentRepository.deleteMedicalEquipment(equipmentId);

    // Assert
    expect(mockPrisma.medicalEquipment.update).toHaveBeenCalledWith({
      where: { id: equipmentId },
      data: {
        deletedOn: mockCurrentDate,
        deletedBy: undefined,
      },
    });

    expect(result).toEqual({
      ...mockEquipment,
      deletedOn: mockCurrentDate,
      deletedBy: undefined,
    });
  });
});
