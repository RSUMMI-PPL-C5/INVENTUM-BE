import { PrismaClient } from "@prisma/client";
import SparepartRepository from "../../../../src/repository/sparepart.repository";
import { SparepartsDTO } from "../../../../src/dto/sparepart.dto";
import prisma from "../../../../src/configs/db.config";
import * as dateUtils from "../../../../src/utils/date.utils";

jest.mock("../../../../src/configs/db.config", () => {
  return {
    __esModule: true,
    default: {
      spareparts: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    },
  };
});

jest.mock("../../../../src/utils/date.utils", () => ({
  getJakartaTime: jest.fn(),
}));

describe("SparepartRepository - UPDATE", () => {
  let sparepartRepository: SparepartRepository;
  let mockPrisma: jest.Mocked<PrismaClient>;
  const mockJakartaTime = new Date("2023-02-15T00:00:00Z");

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = prisma as unknown as jest.Mocked<PrismaClient>;
    sparepartRepository = new SparepartRepository();

    jest.spyOn(dateUtils, "getJakartaTime").mockReturnValue(mockJakartaTime);
  });

  describe("updateSparepart", () => {
    it("should update a sparepart successfully and update modifiedOn", async () => {
      const sparepartId = "existing-id";

      const existingSparepart: SparepartsDTO = {
        id: sparepartId,
        partsName: "Original Part",
        price: 100,
        toolLocation: "Warehouse A",
        createdBy: "1",
        createdOn: new Date("2023-01-01"),
        modifiedOn: new Date("2023-01-01"),
        deletedOn: null,
      };

      const updateData: Partial<SparepartsDTO> = {
        partsName: "Updated Part",
        price: 150,
        modifiedBy: "2",
      };

      const expectedUpdateInput = {
        ...updateData,
        modifiedOn: mockJakartaTime,
      };

      const updatedSparepart = {
        ...existingSparepart,
        ...updateData,
        modifiedOn: mockJakartaTime,
      };

      (mockPrisma.spareparts.findFirst as jest.Mock).mockResolvedValue(
        existingSparepart,
      );
      (mockPrisma.spareparts.update as jest.Mock).mockResolvedValue(
        updatedSparepart,
      );

      const result = await sparepartRepository.updateSparepart(
        sparepartId,
        updateData,
      );

      expect(mockPrisma.spareparts.findFirst).toHaveBeenCalledWith({
        where: { id: sparepartId, deletedOn: null },
      });

      expect(mockPrisma.spareparts.update).toHaveBeenCalledWith({
        where: { id: sparepartId },
        data: expectedUpdateInput,
      });

      expect(result).toEqual(updatedSparepart);
      expect(result!.modifiedOn).toEqual(mockJakartaTime);
      expect(result!.partsName).toBe("Updated Part");
      expect(result!.price).toBe(150);
    });

    it("should return null when the sparepart does not exist", async () => {
      const nonExistentId = "non-existent-id";
      const updateData: Partial<SparepartsDTO> = {
        partsName: "Updated Name",
      };

      (mockPrisma.spareparts.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await sparepartRepository.updateSparepart(
        nonExistentId,
        updateData,
      );

      expect(mockPrisma.spareparts.findFirst).toHaveBeenCalledWith({
        where: { id: nonExistentId, deletedOn: null },
      });

      expect(mockPrisma.spareparts.update).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("should update only the specified fields", async () => {
      const sparepartId = "existing-id";

      const existingSparepart: SparepartsDTO = {
        id: sparepartId,
        partsName: "Original Part",
        price: 100,
        toolLocation: "Warehouse A",
        toolDate: "2023-01-05",
        purchaseDate: new Date("2023-01-01"),
        createdBy: "1",
        createdOn: new Date("2023-01-01"),
        modifiedOn: new Date("2023-01-01"),
        deletedOn: null,
      };

      const updateData: Partial<SparepartsDTO> = {
        price: 200,
      };

      const updatedSparepart = {
        ...existingSparepart,
        price: 200,
        modifiedOn: mockJakartaTime,
      };

      (mockPrisma.spareparts.findFirst as jest.Mock).mockResolvedValue(
        existingSparepart,
      );
      (mockPrisma.spareparts.update as jest.Mock).mockResolvedValue(
        updatedSparepart,
      );

      const result = await sparepartRepository.updateSparepart(
        sparepartId,
        updateData,
      );

      expect(mockPrisma.spareparts.update).toHaveBeenCalledWith({
        where: { id: sparepartId },
        data: {
          price: 200,
          modifiedOn: mockJakartaTime,
        },
      });

      expect(result!.partsName).toBe("Original Part");
      expect(result!.toolLocation).toBe("Warehouse A");
      expect(result!.price).toBe(200);
      expect(result!.modifiedOn).toEqual(mockJakartaTime);
    });

    it("should handle errors when updating a sparepart", async () => {
      const sparepartId = "error-id";
      const updateData: Partial<SparepartsDTO> = {
        partsName: "Error Part",
      };

      const existingSparepart = {
        id: sparepartId,
        partsName: "Original Part",
        createdOn: new Date(),
        deletedOn: null,
      };

      (mockPrisma.spareparts.findFirst as jest.Mock).mockResolvedValue(
        existingSparepart,
      );

      const errorMessage = "Database error during update";
      (mockPrisma.spareparts.update as jest.Mock).mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(
        sparepartRepository.updateSparepart(sparepartId, updateData),
      ).rejects.toThrow(errorMessage);

      expect(mockPrisma.spareparts.findFirst).toHaveBeenCalledWith({
        where: { id: sparepartId, deletedOn: null },
      });

      expect(mockPrisma.spareparts.update).toHaveBeenCalledWith({
        where: { id: sparepartId },
        data: {
          ...updateData,
          modifiedOn: mockJakartaTime,
        },
      });
    });
  });
});
