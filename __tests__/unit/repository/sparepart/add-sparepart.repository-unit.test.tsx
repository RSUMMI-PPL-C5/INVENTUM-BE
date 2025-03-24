import { PrismaClient } from "@prisma/client";
import SparepartRepository from "../../../../src/repository/sparepart.repository";
import { SparepartsDTO } from "../../../../src/dto/sparepart.dto";
import prisma from "../../../../src/configs/db.config";

// Mock the Prisma client
jest.mock("../../../../src/configs/db.config", () => {
  return {
    __esModule: true,
    default: {
      spareparts: {
        create: jest.fn(),
        findUnique: jest.fn(), // Added mock for findUnique
      },
    },
  };
});

describe("SparepartRepository - CREATE", () => {
  let sparepartRepository: SparepartRepository;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = prisma as unknown as jest.Mocked<PrismaClient>;
    sparepartRepository = new SparepartRepository();
  });

  describe("createSparepart", () => {
    it("should create a new sparepart successfully", async () => {
      const mockSparepartData: SparepartsDTO = {
        id: "mock-id",
        partsName: "Test Part",
        purchaseDate: new Date("2023-01-01"),
        price: 100,
        toolLocation: "Warehouse A",
        toolDate: "2023-01-05", // toolDate as string
        createdBy: 1,
        createdOn: new Date("2023-01-01"),
        modifiedOn: new Date("2023-01-01"),
      };

      (mockPrisma.spareparts.create as jest.Mock).mockResolvedValue(
        mockSparepartData,
      );

      const result =
        await sparepartRepository.createSparepart(mockSparepartData);

      expect(mockPrisma.spareparts.create).toHaveBeenCalledWith({
        data: mockSparepartData,
      });
      expect(result).toEqual(mockSparepartData);
    });

    it("should handle errors when creating a sparepart", async () => {
      const mockSparepartData: SparepartsDTO = {
        id: "mock-id",
        partsName: "Test Part",
        purchaseDate: new Date("2023-01-01"),
        price: 100,
        toolLocation: "Warehouse A",
        toolDate: "2023-01-05", // toolDate as string
        createdBy: 1,
        createdOn: new Date("2023-01-01"),
        modifiedOn: new Date("2023-01-01"),
      };

      const errorMessage = "Database error";
      (mockPrisma.spareparts.create as jest.Mock).mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(
        sparepartRepository.createSparepart(mockSparepartData),
      ).rejects.toThrow(errorMessage);
      expect(mockPrisma.spareparts.create).toHaveBeenCalledWith({
        data: mockSparepartData,
      });
    });

    it("should create a sparepart with minimal required fields", async () => {
      const minimalSparepartData = {
        id: "minimal-id",
        partsName: "Minimal Part",
        createdBy: 1,
      };

      const expectedResponse = {
        ...minimalSparepartData,
        purchaseDate: null,
        price: null,
        toolLocation: null,
        toolDate: null,
        createdOn: expect.any(Date),
        modifiedOn: expect.any(Date),
      };

      (mockPrisma.spareparts.create as jest.Mock).mockResolvedValue(
        expectedResponse,
      );

      const result =
        await sparepartRepository.createSparepart(minimalSparepartData);

      expect(mockPrisma.spareparts.create).toHaveBeenCalledWith({
        data: minimalSparepartData,
      });
      expect(result).toEqual(expectedResponse);
    });
  });

  // Added tests for getSparepartById
  describe("getSparepartById", () => {
    it("should get a sparepart by id", async () => {
      const mockSparepart: SparepartsDTO = {
        id: "1",
        partsName: "Test Part",
        purchaseDate: new Date("2023-01-01"),
        price: 100,
        toolLocation: "Warehouse A",
        toolDate: "2023-01-05", // toolDate as string
        createdBy: 1,
        createdOn: new Date("2023-01-01"),
        modifiedOn: new Date("2023-01-01"),
      };

      (mockPrisma.spareparts.findUnique as jest.Mock).mockResolvedValue(
        mockSparepart,
      );

      const result = await sparepartRepository.getSparepartById("1");

      expect(mockPrisma.spareparts.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
      });
      expect(result).toEqual(mockSparepart);
    });

    it("should return null if sparepart not found", async () => {
      (mockPrisma.spareparts.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await sparepartRepository.getSparepartById("999");

      expect(mockPrisma.spareparts.findUnique).toHaveBeenCalledWith({
        where: { id: "999" },
      });
      expect(result).toBeNull();
    });

    it("should handle errors when getting a sparepart", async () => {
      const errorMessage = "Database error";
      (mockPrisma.spareparts.findUnique as jest.Mock).mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(sparepartRepository.getSparepartById("1")).rejects.toThrow(
        errorMessage,
      );
      expect(mockPrisma.spareparts.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
      });
    });
  });
});
