import MedicalEquipmentRepository from "../../../../src/repository/medical-equipment.repository";
import { MedicalEquipmentFilterOptions } from "../../../../src/interfaces/medical-equipment.filter.interface";
import { PaginationOptions } from "../../../../src/interfaces/pagination.interface";

// Mock Prisma
jest.mock("@prisma/client", () => {
  const mockPrismaClient = {
    medicalEquipment: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

// Mock getJakartaTime
jest.mock("../../../../src/utils/date.utils", () => ({
  getJakartaTime: jest.fn(() => new Date("2025-04-21T10:00:00Z")),
}));

describe("MedicalEquipmentRepository - Get Methods", () => {
  let repository: MedicalEquipmentRepository;
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new MedicalEquipmentRepository();
    mockPrisma = (repository as any).prisma;
  });

  describe("getMedicalEquipment", () => {
    it("should return equipment list with total count", async () => {
      // Arrange
      const mockEquipments = [
        { id: "1", name: "Equipment 1", status: "Active" },
        { id: "2", name: "Equipment 2", status: "Maintenance" },
      ];

      mockPrisma.medicalEquipment.findMany.mockResolvedValue(mockEquipments);
      mockPrisma.medicalEquipment.count.mockResolvedValue(2);

      // Act
      const result = await repository.getMedicalEquipment();

      // Assert
      expect(mockPrisma.medicalEquipment.findMany).toHaveBeenCalledWith({
        where: { deletedOn: null },
        skip: undefined,
        take: undefined,
        orderBy: { modifiedOn: "desc" },
      });
      expect(mockPrisma.medicalEquipment.count).toHaveBeenCalledWith({
        where: { deletedOn: null },
      });
      expect(result).toEqual({
        equipments: mockEquipments,
        total: 2,
      });
    });

    it("should apply search parameter to multiple fields", async () => {
      // Arrange
      const search = "test";
      mockPrisma.medicalEquipment.findMany.mockResolvedValue([]);
      mockPrisma.medicalEquipment.count.mockResolvedValue(0);

      // Act
      await repository.getMedicalEquipment(search);

      // Assert
      const expectedWhere = {
        deletedOn: null,
        OR: [
          { name: { contains: "test" } },
          { lastLocation: { contains: "test" } },
          { brandName: { contains: "test" } },
        ],
      };

      expect(mockPrisma.medicalEquipment.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        skip: undefined,
        take: undefined,
        orderBy: { modifiedOn: "desc" },
      });
      expect(mockPrisma.medicalEquipment.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
    });

    it("should apply status filter correctly", async () => {
      // Arrange
      const filters: MedicalEquipmentFilterOptions = {
        status: ["Active", "Maintenance"],
      };

      mockPrisma.medicalEquipment.findMany.mockResolvedValue([]);
      mockPrisma.medicalEquipment.count.mockResolvedValue(0);

      // Act
      await repository.getMedicalEquipment(undefined, filters);

      // Assert
      const expectedWhere = {
        deletedOn: null,
        status: { in: ["Active", "Maintenance"] },
      };

      expect(mockPrisma.medicalEquipment.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        skip: undefined,
        take: undefined,
        orderBy: { modifiedOn: "desc" },
      });
    });

    it("should apply purchase date filters correctly", async () => {
      // Arrange
      const startDate = new Date("2025-01-01");
      const endDate = new Date("2025-12-31");

      const filters: MedicalEquipmentFilterOptions = {
        purchaseDateStart: startDate,
        purchaseDateEnd: endDate,
      };

      mockPrisma.medicalEquipment.findMany.mockResolvedValue([]);
      mockPrisma.medicalEquipment.count.mockResolvedValue(0);

      // Act
      await repository.getMedicalEquipment(undefined, filters);

      // Assert
      const expectedWhere = {
        deletedOn: null,
        purchaseDate: {
          gte: startDate,
          lte: endDate,
        },
      };

      expect(mockPrisma.medicalEquipment.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        skip: undefined,
        take: undefined,
        orderBy: { modifiedOn: "desc" },
      });
    });

    it("should apply createdOn filters correctly", async () => {
      // Arrange
      const startDate = new Date("2025-01-01");
      const endDate = new Date("2025-12-31");

      const filters: MedicalEquipmentFilterOptions = {
        createdOnStart: startDate,
        createdOnEnd: endDate,
      };

      mockPrisma.medicalEquipment.findMany.mockResolvedValue([]);
      mockPrisma.medicalEquipment.count.mockResolvedValue(0);

      // Act
      await repository.getMedicalEquipment(undefined, filters);

      // Assert
      const expectedWhere = {
        deletedOn: null,
        createdOn: {
          gte: startDate,
          lte: endDate,
        },
      };

      expect(mockPrisma.medicalEquipment.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        skip: undefined,
        take: undefined,
        orderBy: { modifiedOn: "desc" },
      });
    });

    it("should apply modifiedOn filters correctly", async () => {
      // Arrange
      const startDate = new Date("2025-01-01");
      const endDate = new Date("2025-12-31");

      const filters: MedicalEquipmentFilterOptions = {
        modifiedOnStart: startDate,
        modifiedOnEnd: endDate,
      };

      mockPrisma.medicalEquipment.findMany.mockResolvedValue([]);
      mockPrisma.medicalEquipment.count.mockResolvedValue(0);

      // Act
      await repository.getMedicalEquipment(undefined, filters);

      // Assert
      const expectedWhere = {
        deletedOn: null,
        modifiedOn: {
          gte: startDate,
          lte: endDate,
        },
      };

      expect(mockPrisma.medicalEquipment.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        skip: undefined,
        take: undefined,
        orderBy: { modifiedOn: "desc" },
      });
    });

    it("should apply pagination correctly", async () => {
      // Arrange
      const pagination: PaginationOptions = {
        page: 2,
        limit: 10,
      };

      mockPrisma.medicalEquipment.findMany.mockResolvedValue([]);
      mockPrisma.medicalEquipment.count.mockResolvedValue(25);

      // Act
      await repository.getMedicalEquipment(undefined, undefined, pagination);

      // Assert
      expect(mockPrisma.medicalEquipment.findMany).toHaveBeenCalledWith({
        where: { deletedOn: null },
        skip: 10, // (page-1) * limit
        take: 10,
        orderBy: { modifiedOn: "desc" },
      });
    });

    it("should combine search, filters and pagination", async () => {
      // Arrange
      const search = "test";
      const filters: MedicalEquipmentFilterOptions = {
        status: ["Active"],
        createdOnStart: new Date("2025-01-01"),
      };
      const pagination: PaginationOptions = {
        page: 2,
        limit: 5,
      };

      mockPrisma.medicalEquipment.findMany.mockResolvedValue([]);
      mockPrisma.medicalEquipment.count.mockResolvedValue(0);

      // Act
      await repository.getMedicalEquipment(search, filters, pagination);

      // Assert
      const expectedWhere = {
        deletedOn: null,
        OR: [
          { name: { contains: "test" } },
          { lastLocation: { contains: "test" } },
          { brandName: { contains: "test" } },
        ],
        status: { in: ["Active"] },
        createdOn: { gte: filters.createdOnStart },
      };

      expect(mockPrisma.medicalEquipment.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        skip: 5,
        take: 5,
        orderBy: { modifiedOn: "desc" },
      });
    });
  });

  describe("findByInventorisId", () => {
    it("should find equipment by inventorisId", async () => {
      // Arrange
      const inventorisId = "INV001";
      const mockEquipment = {
        id: "1",
        inventorisId: "INV001",
        name: "Test Equipment",
        brandName: "Brand",
        modelName: "Model",
      };

      mockPrisma.medicalEquipment.findUnique.mockResolvedValue(mockEquipment);

      // Act
      const result = await repository.findByInventorisId(inventorisId);

      // Assert
      expect(mockPrisma.medicalEquipment.findUnique).toHaveBeenCalledWith({
        where: {
          inventorisId: "INV001",
          deletedOn: null,
        },
        select: {
          id: true,
          inventorisId: true,
          name: true,
          brandName: true,
          modelName: true,
        },
      });
      expect(result).toEqual(mockEquipment);
    });

    it("should convert null brandName and modelName to undefined", async () => {
      // Arrange
      const inventorisId = "INV001";
      const mockEquipment = {
        id: "1",
        inventorisId: "INV001",
        name: "Test Equipment",
        brandName: null,
        modelName: null,
      };

      mockPrisma.medicalEquipment.findUnique.mockResolvedValue(mockEquipment);

      // Act
      const result = await repository.findByInventorisId(inventorisId);

      // Assert
      expect(result).toEqual({
        ...mockEquipment,
        brandName: undefined,
        modelName: undefined,
      });
    });

    it("should return null when equipment not found", async () => {
      // Arrange
      mockPrisma.medicalEquipment.findUnique.mockResolvedValue(null);

      // Act
      const result = await repository.findByInventorisId("NONEXISTENT");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("findById", () => {
    it("should find equipment by id", async () => {
      // Arrange
      const id = "123";
      const mockEquipment = {
        id: "123",
        inventorisId: "INV123",
        name: "Test Equipment",
        brandName: "Brand",
        modelName: "Model",
      };

      mockPrisma.medicalEquipment.findFirst.mockResolvedValue(mockEquipment);

      // Act
      const result = await repository.findById(id);

      // Assert
      expect(mockPrisma.medicalEquipment.findFirst).toHaveBeenCalledWith({
        where: {
          id: "123",
          deletedOn: null,
        },
        select: {
          id: true,
          inventorisId: true,
          name: true,
          brandName: true,
          modelName: true,
        },
      });
      expect(result).toEqual(mockEquipment);
    });

    it("should convert null brandName and modelName to undefined", async () => {
      // Arrange
      const id = "456";
      const mockEquipment = {
        id: "456",
        inventorisId: "INV456",
        name: "Test Equipment",
        brandName: null,
        modelName: null,
      };

      mockPrisma.medicalEquipment.findFirst.mockResolvedValue(mockEquipment);

      // Act
      const result = await repository.findById(id);

      // Assert
      expect(result).toEqual({
        ...mockEquipment,
        brandName: undefined,
        modelName: undefined,
      });
    });

    it("should return null when equipment not found", async () => {
      // Arrange
      mockPrisma.medicalEquipment.findFirst.mockResolvedValue(null);

      // Act
      const result = await repository.findById("NONEXISTENT");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("getMedicalEquipmentById", () => {
    it("should get full equipment details by id", async () => {
      // Arrange
      const id = "123";
      const mockEquipment = {
        id: "123",
        inventorisId: "INV123",
        name: "Test Equipment",
        status: "Active",
        purchaseDate: new Date(),
        purchasePrice: 1000,
        // Other fields
      };

      mockPrisma.medicalEquipment.findFirst.mockResolvedValue(mockEquipment);

      // Act
      const result = await repository.getMedicalEquipmentById(id);

      // Assert
      expect(mockPrisma.medicalEquipment.findFirst).toHaveBeenCalledWith({
        where: {
          id: "123",
          deletedOn: null,
        },
      });
      expect(result).toEqual(mockEquipment);
    });

    it("should return null when equipment not found", async () => {
      // Arrange
      mockPrisma.medicalEquipment.findFirst.mockResolvedValue(null);

      // Act
      const result = await repository.getMedicalEquipmentById("NONEXISTENT");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("getMedicalEquipmentByName", () => {
    it("should find equipment by name substring", async () => {
      // Arrange
      const nameQuery = "scanner";
      const mockEquipment = [
        { id: "1", name: "CT Scanner", status: "Active" },
        { id: "2", name: "MRI Scanner", status: "Maintenance" },
      ];

      mockPrisma.medicalEquipment.findMany.mockResolvedValue(mockEquipment);

      // Act
      const result = await repository.getMedicalEquipmentByName(nameQuery);

      // Assert
      expect(mockPrisma.medicalEquipment.findMany).toHaveBeenCalledWith({
        where: {
          name: { contains: "scanner" },
          deletedOn: null,
        },
      });
      expect(result).toEqual(mockEquipment);
    });

    it("should return empty array when no equipment matches the name", async () => {
      // Arrange
      mockPrisma.medicalEquipment.findMany.mockResolvedValue([]);

      // Act
      const result = await repository.getMedicalEquipmentByName("nonexistent");

      // Assert
      expect(result).toEqual([]);
    });
  });
});
