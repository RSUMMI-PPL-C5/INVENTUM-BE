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
        update: jest.fn(),
        findUnique: jest.fn(),
      },
    },
  };
});

describe("SparepartRepository - UPDATE", () => {
  let sparepartRepository: SparepartRepository;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = prisma as unknown as jest.Mocked<PrismaClient>;
    sparepartRepository = new SparepartRepository();
  });

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

  describe("updateSparepart", () => {
    it("should update a sparepart successfully", async () => {
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

      const updateData: Partial<SparepartsDTO> = {
        partsName: "Updated Part",
        price: 150,
        toolDate: "2023-02-05", // toolDate as string
        modifiedBy: 2,
        modifiedOn: new Date("2023-02-01"),
      };

      const updatedSparepart = {
        ...mockSparepart,
        ...updateData,
      };

      (mockPrisma.spareparts.update as jest.Mock).mockResolvedValue(
        updatedSparepart,
      );

      const result = await sparepartRepository.updateSparepart("1", updateData);

      expect(mockPrisma.spareparts.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: updateData,
      });
      expect(result).toEqual(updatedSparepart);
    });

    it("should handle errors when updating a sparepart", async () => {
      const updateData: Partial<SparepartsDTO> = {
        partsName: "Updated Part",
        price: 150,
        toolDate: "2023-02-05", // toolDate as string
      };

      const errorMessage = "Record to update not found";
      (mockPrisma.spareparts.update as jest.Mock).mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(
        sparepartRepository.updateSparepart("999", updateData),
      ).rejects.toThrow(errorMessage);
      expect(mockPrisma.spareparts.update).toHaveBeenCalledWith({
        where: { id: "999" },
        data: updateData,
      });
    });

    it("should update only the provided fields", async () => {
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

      // Only update partsName
      const updateData: Partial<SparepartsDTO> = {
        partsName: "Updated Part Name Only",
      };

      const updatedSparepart = {
        ...mockSparepart,
        partsName: "Updated Part Name Only",
      };

      (mockPrisma.spareparts.update as jest.Mock).mockResolvedValue(
        updatedSparepart,
      );

      const result = await sparepartRepository.updateSparepart("1", updateData);

      expect(mockPrisma.spareparts.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: updateData,
      });
      expect(result).toEqual(updatedSparepart);
      expect(result!.partsName).toBe("Updated Part Name Only");
      expect(result!.price).toBe(mockSparepart.price); // Unchanged
    });
  });
});
