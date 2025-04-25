import { PrismaClient } from "@prisma/client";
import SparepartRepository from "../../../../src/repository/sparepart.repository";
import prisma from "../../../../src/configs/db.config";
import * as dateUtils from "../../../../src/utils/date.utils";

// Mock the Prisma client
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

// Mock the date utils
jest.mock("../../../../src/utils/date.utils", () => ({
  getJakartaTime: jest.fn(),
}));

describe("SparepartRepository - DELETE", () => {
  let sparepartRepository: SparepartRepository;
  let mockPrisma: jest.Mocked<PrismaClient>;
  const mockJakartaTime = new Date("2023-01-15T00:00:00Z");

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = prisma as unknown as jest.Mocked<PrismaClient>;
    sparepartRepository = new SparepartRepository();

    // Mock the Jakarta time
    jest.spyOn(dateUtils, "getJakartaTime").mockReturnValue(mockJakartaTime);
  });

  describe("deleteSparepart", () => {
    it("should soft delete an existing sparepart", async () => {
      const sparepartId = "existing-id";
      const deletedById = "user-123";

      // Mock the existing sparepart
      const existingSparepart = {
        id: sparepartId,
        partsName: "Test Part",
        createdBy: "1",
        createdOn: new Date("2023-01-01"),
        modifiedOn: new Date("2023-01-01"),
        deletedOn: null,
        deletedBy: null,
      };

      // Expected updated sparepart after deletion
      const updatedSparepart = {
        ...existingSparepart,
        deletedOn: mockJakartaTime,
        deletedBy: deletedById,
      };

      // Setup mocks
      (mockPrisma.spareparts.findFirst as jest.Mock).mockResolvedValue(
        existingSparepart,
      );
      (mockPrisma.spareparts.update as jest.Mock).mockResolvedValue(
        updatedSparepart,
      );

      // Execute deletion
      const result = await sparepartRepository.deleteSparepart(
        sparepartId,
        deletedById,
      );

      // Verify findFirst was called with correct parameters
      expect(mockPrisma.spareparts.findFirst).toHaveBeenCalledWith({
        where: { id: sparepartId, deletedOn: null },
      });

      // Verify update was called with correct parameters
      expect(mockPrisma.spareparts.update).toHaveBeenCalledWith({
        where: { id: sparepartId },
        data: {
          deletedOn: mockJakartaTime,
          deletedBy: deletedById,
        },
      });

      // Verify result
      expect(result).toEqual(updatedSparepart);
    });

    it("should return null when the sparepart does not exist", async () => {
      const nonExistentId = "non-existent-id";

      // Mock findFirst to return null (sparepart not found)
      (mockPrisma.spareparts.findFirst as jest.Mock).mockResolvedValue(null);

      // Execute deletion
      const result = await sparepartRepository.deleteSparepart(nonExistentId);

      // Verify findFirst was called
      expect(mockPrisma.spareparts.findFirst).toHaveBeenCalledWith({
        where: { id: nonExistentId, deletedOn: null },
      });

      // Verify update was NOT called
      expect(mockPrisma.spareparts.update).not.toHaveBeenCalled();

      // Verify result is null
      expect(result).toBeNull();
    });

    it("should return null when the sparepart is already deleted", async () => {
      const alreadyDeletedId = "already-deleted-id";

      // Mock findFirst to return null (because we filter by deletedOn: null)
      (mockPrisma.spareparts.findFirst as jest.Mock).mockResolvedValue(null);

      // Execute deletion
      const result =
        await sparepartRepository.deleteSparepart(alreadyDeletedId);

      // Verify findFirst was called
      expect(mockPrisma.spareparts.findFirst).toHaveBeenCalledWith({
        where: { id: alreadyDeletedId, deletedOn: null },
      });

      // Verify update was NOT called
      expect(mockPrisma.spareparts.update).not.toHaveBeenCalled();

      // Verify result is null
      expect(result).toBeNull();
    });

    it("should handle errors when deleting a sparepart", async () => {
      const sparepartId = "error-id";

      // Mock the existing sparepart
      const existingSparepart = {
        id: sparepartId,
        partsName: "Error Part",
        createdOn: new Date(),
        deletedOn: null,
      };

      // Setup mocks
      (mockPrisma.spareparts.findFirst as jest.Mock).mockResolvedValue(
        existingSparepart,
      );

      const errorMessage = "Database error during update";
      (mockPrisma.spareparts.update as jest.Mock).mockRejectedValue(
        new Error(errorMessage),
      );

      // Expect the error to be thrown
      await expect(
        sparepartRepository.deleteSparepart(sparepartId),
      ).rejects.toThrow(errorMessage);

      // Verify findFirst was called
      expect(mockPrisma.spareparts.findFirst).toHaveBeenCalledWith({
        where: { id: sparepartId, deletedOn: null },
      });

      // Verify update was called
      expect(mockPrisma.spareparts.update).toHaveBeenCalledWith({
        where: { id: sparepartId },
        data: {
          deletedOn: mockJakartaTime,
          deletedBy: undefined,
        },
      });
    });
  });
});
