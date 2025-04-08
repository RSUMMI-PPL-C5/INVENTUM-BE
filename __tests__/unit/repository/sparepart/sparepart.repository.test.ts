// __tests__/unit/repository/sparepart/sparepart.repository.unit.test.ts
import SparepartRepository from "../../../../src/repository/sparepart.repository";
import prisma from "../../../../src/configs/db.config";

// Mock the Prisma client
jest.mock("../../../../src/configs/db.config", () => ({
  spareparts: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
}));

describe("SparepartRepository", () => {
  let sparepartRepository: SparepartRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    sparepartRepository = new SparepartRepository();
  });

  describe("getSpareparts", () => {
    it("should return all spareparts", async () => {
      const mockSpareparts = [
        {
          id: "1",
          partsName: "Test Part 1",
          purchaseDate: new Date(),
          price: 100,
          toolLocation: "Location 1",
          toolDate: "2025-03-24",
        },
        {
          id: "2",
          partsName: "Test Part 2",
          purchaseDate: new Date(),
          price: 200,
          toolLocation: "Location 2",
          toolDate: "2025-03-24",
        },
      ];

      (prisma.spareparts.findMany as jest.Mock).mockResolvedValue(
        mockSpareparts,
      );

      const result = await sparepartRepository.getSpareparts();

      expect(prisma.spareparts.findMany).toHaveBeenCalledWith({
        where: { deletedOn: null },
      });
      expect(result).toEqual(mockSpareparts);
    });
  });

  describe("getSparepartById", () => {
    it("should return a sparepart by ID", async () => {
      const mockSparepart = {
        id: "1",
        partsName: "Test Part 1",
        purchaseDate: new Date(),
        price: 100,
        toolLocation: "Location 1",
        toolDate: "2025-03-24",
      };

      (prisma.spareparts.findUnique as jest.Mock).mockResolvedValue(
        mockSparepart,
      );

      const result = await sparepartRepository.getSparepartById("1");

      // Updated expectation to include deletedOn: null
      expect(prisma.spareparts.findUnique).toHaveBeenCalledWith({
        where: { id: "1", deletedOn: null },
      });
      expect(result).toEqual(mockSparepart);
    });

    it("should return null if sparepart not found", async () => {
      (prisma.spareparts.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await sparepartRepository.getSparepartById("999");

      // Updated expectation to include deletedOn: null
      expect(prisma.spareparts.findUnique).toHaveBeenCalledWith({
        where: { id: "999", deletedOn: null },
      });
      expect(result).toBeNull();
    });
  });
});
