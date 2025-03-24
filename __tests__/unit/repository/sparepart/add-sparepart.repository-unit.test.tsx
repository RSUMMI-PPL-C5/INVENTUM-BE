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
});
