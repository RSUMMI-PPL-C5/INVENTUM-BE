import MedicalEquipmentRepository from "../../../../src/repository/add-medicalequipment.repository";
import {
  AddMedicalEquipmentDTO,
  AddMedicalEquipmentResponseDTO,
} from "../../../../src/dto/medicalequipment.dto";
import { v4 as uuidv4 } from "uuid";

// Mock Prisma Client
jest.mock("@prisma/client", () => {
  const mockCreate = jest.fn();
  const mockFindUnique = jest.fn();

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      medicalEquipment: {
        create: mockCreate,
        findUnique: mockFindUnique,
      },
    })),
    __mockPrisma: {
      create: mockCreate,
      findUnique: mockFindUnique,
    },
  };
});

// Get access to mocked Prisma functions
const { __mockPrisma: mockPrisma } = jest.requireMock("@prisma/client");

describe("MedicalEquipmentRepository", () => {
  let medicalEquipmentRepository: MedicalEquipmentRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    medicalEquipmentRepository = new MedicalEquipmentRepository();
  });

  // Positive Test
  it("should successfully add medical equipment", async () => {
    const equipmentData: AddMedicalEquipmentDTO = {
      inventorisId: "INV-001",
      name: "MRI Scanner",
      brandName: "Siemens",
      modelName: "Magnetom",
      createdBy: 1,
    };

    const expectedResponse: AddMedicalEquipmentResponseDTO = {
      id: uuidv4(),
      ...equipmentData,
    };

    mockPrisma.create.mockResolvedValue(expectedResponse);

    const result =
      await medicalEquipmentRepository.addMedicalEquipment(equipmentData);

    expect(mockPrisma.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        inventorisId: "INV-001",
        name: "MRI Scanner",
      }),
      select: expect.any(Object),
    });

    expect(result).toEqual(expectedResponse);
  });

  // Negative Test
  it("should return existing record if inventorisId already exists", async () => {
    const existingEquipment: AddMedicalEquipmentResponseDTO = {
      id: uuidv4(),
      inventorisId: "INV-001",
      name: "MRI Scanner",
      brandName: "Siemens",
      modelName: "Magnetom",
    };

    mockPrisma.findUnique.mockResolvedValue(existingEquipment);

    const result =
      await medicalEquipmentRepository.findByInventorisId("INV-001");

    expect(result).toEqual(existingEquipment);
    expect(mockPrisma.findUnique).toHaveBeenCalledWith({
      where: { inventorisId: "INV-001" },
      select: {
        id: true,
        inventorisId: true,
        name: true,
        brandName: true,
        modelName: true,
      },
    });
  });

  it("should throw an error if database connection fails", async () => {
    mockPrisma.create.mockRejectedValue(new Error("Database connection error"));

    const equipmentData: AddMedicalEquipmentDTO = {
      inventorisId: "INV-002",
      name: "CT Scanner",
      createdBy: 1,
    };

    await expect(
      medicalEquipmentRepository.addMedicalEquipment(equipmentData),
    ).rejects.toThrow("Database connection error");
  });

  // UUID Generation Test
  it("should generate a valid UUID for the ID", async () => {
    const mockUuid = uuidv4();
    const equipmentData: AddMedicalEquipmentDTO = {
      inventorisId: "INV-003",
      name: "Ultrasound Machine",
      createdBy: 1,
    };

    // Mock a successful response with a UUID
    mockPrisma.create.mockResolvedValue({
      id: mockUuid,
      ...equipmentData,
    });

    const result =
      await medicalEquipmentRepository.addMedicalEquipment(equipmentData);

    expect(result.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it("should throw an error if findByInventorisId query fails", async () => {
    mockPrisma.findUnique.mockRejectedValue(new Error("Database error"));

    await expect(
      medicalEquipmentRepository.findByInventorisId("INV-999"),
    ).rejects.toThrow("Database error");
  });

  it("should return null if medical equipment is not found", async () => {
    mockPrisma.findUnique.mockResolvedValue(null);

    const result =
      await medicalEquipmentRepository.findByInventorisId("INV-404");

    expect(result).toBeNull();
    expect(mockPrisma.findUnique).toHaveBeenCalledWith({
      where: { inventorisId: "INV-404" },
      select: expect.any(Object),
    });
  });

  it("should throw an error if findByInventorisId query fails", async () => {
    mockPrisma.findUnique.mockRejectedValue(new Error("Database error"));

    await expect(
      medicalEquipmentRepository.findByInventorisId("INV-999"),
    ).rejects.toThrow("Database error");
  });

  // Corner case
  it("should return null if medical equipment is not found", async () => {
    mockPrisma.findUnique.mockResolvedValue(null);

    const result =
      await medicalEquipmentRepository.findByInventorisId("INV-404");

    expect(result).toBeNull();
    expect(mockPrisma.findUnique).toHaveBeenCalledWith({
      where: { inventorisId: "INV-404" },
      select: expect.any(Object),
    });
  });

  // Edge case
  it("should return equipment with undefined brandName and modelName if they are null in DB", async () => {
    const dbResponse = {
      id: "uuid-123",
      inventorisId: "INV-TEST",
      name: "Test Equipment",
      brandName: null,
      modelName: null,
    };

    const expectedResponse = {
      ...dbResponse,
      brandName: undefined,
      modelName: undefined,
    };

    mockPrisma.findUnique.mockResolvedValue(dbResponse);

    const result =
      await medicalEquipmentRepository.findByInventorisId("INV-TEST");

    expect(result).toEqual(expectedResponse);
    expect(mockPrisma.findUnique).toHaveBeenCalledWith({
      where: { inventorisId: "INV-TEST" },
      select: expect.any(Object),
    });
  });

  it("should return equipment with undefined brandName and modelName if they are undefined in DB", async () => {
    const dbResponse = {
      id: "uuid-456",
      inventorisId: "INV-TEST-2",
      name: "Test Equipment 2",
      brandName: undefined,
      modelName: undefined,
    };

    mockPrisma.findUnique.mockResolvedValue(dbResponse);

    const result =
      await medicalEquipmentRepository.findByInventorisId("INV-TEST-2");

    expect(result).toEqual(dbResponse);
    expect(mockPrisma.findUnique).toHaveBeenCalledWith({
      where: { inventorisId: "INV-TEST-2" },
      select: expect.any(Object),
    });
  });
});
