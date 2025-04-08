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
        delete: jest.fn(),
        findUnique: jest.fn(),
      },
    },
  };
});

describe("SparepartRepository - DELETE", () => {
  let sparepartRepository: SparepartRepository;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = prisma as unknown as jest.Mocked<PrismaClient>;
    sparepartRepository = new SparepartRepository();
  });

  describe("deleteSparepart", () => {
    it("should delete a sparepart successfully", async () => {
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

      (mockPrisma.spareparts.delete as jest.Mock).mockResolvedValue(
        mockSparepart,
      );

      const result = await sparepartRepository.deleteSparepart("1");

      expect(mockPrisma.spareparts.delete).toHaveBeenCalledWith({
        where: { id: "1" },
      });
      expect(result).toEqual(mockSparepart);
    });

    it("should handle errors when deleting a non-existent sparepart", async () => {
      const errorMessage = "Record to delete does not exist";
      (mockPrisma.spareparts.delete as jest.Mock).mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(sparepartRepository.deleteSparepart("999")).rejects.toThrow(
        errorMessage,
      );
      expect(mockPrisma.spareparts.delete).toHaveBeenCalledWith({
        where: { id: "999" },
      });
    });

    it("should handle database errors during deletion", async () => {
      const errorMessage = "Database connection error";
      (mockPrisma.spareparts.delete as jest.Mock).mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(sparepartRepository.deleteSparepart("1")).rejects.toThrow(
        errorMessage,
      );
      expect(mockPrisma.spareparts.delete).toHaveBeenCalledWith({
        where: { id: "1" },
      });
    });

    it("should return the deleted sparepart data", async () => {
      const deletedSparepart: SparepartsDTO = {
        id: "1",
        partsName: "Test Part",
        purchaseDate: new Date("2023-01-01"),
        price: 100,
        toolLocation: "Warehouse A",
        toolDate: "2023-01-05", // toolDate as string
        createdBy: 1,
        createdOn: new Date("2023-01-01"),
        modifiedOn: new Date("2023-01-01"),
        deletedOn: new Date(),
      };

      (mockPrisma.spareparts.delete as jest.Mock).mockResolvedValue(
        deletedSparepart,
      );

      const result = await sparepartRepository.deleteSparepart("1");

      expect(mockPrisma.spareparts.delete).toHaveBeenCalledWith({
        where: { id: "1" },
      });
      expect(result).toEqual(deletedSparepart);
      expect(result!.deletedOn).toBeDefined();
    });
  });
});
