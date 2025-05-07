import { PrismaClient } from "@prisma/client";
import SparepartRepository from "../../../../src/repository/sparepart.repository";
import { SparepartFilterOptions } from "../../../../src/interfaces/spareparts.filter.interface";
import { PaginationOptions } from "../../../../src/interfaces/pagination.interface";
import prisma from "../../../../src/configs/db.config";

// Mock the Prisma client
jest.mock("../../../../src/configs/db.config", () => {
  return {
    __esModule: true,
    default: {
      spareparts: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
      },
    },
  };
});

describe("SparepartRepository - READ", () => {
  let sparepartRepository: SparepartRepository;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = prisma as unknown as jest.Mocked<PrismaClient>;
    sparepartRepository = new SparepartRepository();
  });

  describe("getSpareparts", () => {
    const mockSpareparts = [
      {
        id: "1",
        partsName: "Test Part 1",
        purchaseDate: new Date("2023-01-15"),
        price: 100,
        toolLocation: "Location A",
        toolDate: "2023-01-20",
        createdBy: "user1",
        createdOn: new Date("2023-01-01"),
        modifiedBy: "user1",
        modifiedOn: new Date("2023-01-01"),
        deletedOn: null,
        deletedBy: null,
      },
      {
        id: "2",
        partsName: "Test Part 2",
        purchaseDate: new Date("2023-02-15"),
        price: 200,
        toolLocation: "Location B",
        toolDate: "2023-02-20",
        createdBy: "user1",
        createdOn: new Date("2023-02-01"),
        modifiedBy: "user2",
        modifiedOn: new Date("2023-02-10"),
        deletedOn: null,
        deletedBy: null,
      },
    ];

    it("should return all spareparts with no filters, search or pagination", async () => {
      // Setup mock
      (mockPrisma.spareparts.findMany as jest.Mock).mockResolvedValue(
        mockSpareparts,
      );
      (mockPrisma.spareparts.count as jest.Mock).mockResolvedValue(2);

      // Call the method
      const result = await sparepartRepository.getSpareparts();

      // Verify prisma method calls
      expect(mockPrisma.spareparts.findMany).toHaveBeenCalledWith({
        where: { deletedOn: null },
        skip: undefined,
        take: undefined,
        orderBy: { modifiedOn: "desc" },
      });
      expect(mockPrisma.spareparts.count).toHaveBeenCalledWith({
        where: { deletedOn: null },
      });

      // Verify result
      expect(result).toEqual({
        spareparts: mockSpareparts,
        total: 2,
      });
    });

    it("should apply search filter correctly", async () => {
      const searchTerm = "Test";
      const expectedWhereClause = {
        deletedOn: null,
        OR: [
          { partsName: { contains: searchTerm } },
          { toolLocation: { contains: searchTerm } },
        ],
      };

      // Setup mock
      (mockPrisma.spareparts.findMany as jest.Mock).mockResolvedValue(
        mockSpareparts,
      );
      (mockPrisma.spareparts.count as jest.Mock).mockResolvedValue(2);

      // Call the method
      const result = await sparepartRepository.getSpareparts(searchTerm);

      // Verify prisma method calls
      expect(mockPrisma.spareparts.findMany).toHaveBeenCalledWith({
        where: expectedWhereClause,
        skip: undefined,
        take: undefined,
        orderBy: { modifiedOn: "desc" },
      });
      expect(mockPrisma.spareparts.count).toHaveBeenCalledWith({
        where: expectedWhereClause,
      });

      // Verify result
      expect(result).toEqual({
        spareparts: mockSpareparts,
        total: 2,
      });
    });

    it("should apply partsName filter correctly", async () => {
      const filters: SparepartFilterOptions = {
        partsName: "Part 1",
      };
      const expectedWhereClause = {
        deletedOn: null,
        partsName: { contains: "Part 1" },
      };

      // Setup mock
      (mockPrisma.spareparts.findMany as jest.Mock).mockResolvedValue([
        mockSpareparts[0],
      ]);
      (mockPrisma.spareparts.count as jest.Mock).mockResolvedValue(1);

      // Call the method
      const result = await sparepartRepository.getSpareparts(
        undefined,
        filters,
      );

      // Verify prisma method calls
      expect(mockPrisma.spareparts.findMany).toHaveBeenCalledWith({
        where: expectedWhereClause,
        skip: undefined,
        take: undefined,
        orderBy: { modifiedOn: "desc" },
      });
      expect(mockPrisma.spareparts.count).toHaveBeenCalledWith({
        where: expectedWhereClause,
      });

      // Verify result
      expect(result).toEqual({
        spareparts: [mockSpareparts[0]],
        total: 1,
      });
    });

    it("should apply toolLocation filter correctly", async () => {
      const filters: SparepartFilterOptions = {
        toolLocation: "Location B",
      };
      const expectedWhereClause = {
        deletedOn: null,
        toolLocation: { contains: "Location B" },
      };

      // Setup mock
      (mockPrisma.spareparts.findMany as jest.Mock).mockResolvedValue([
        mockSpareparts[1],
      ]);
      (mockPrisma.spareparts.count as jest.Mock).mockResolvedValue(1);

      // Call the method
      const result = await sparepartRepository.getSpareparts(
        undefined,
        filters,
      );

      // Verify prisma method calls
      expect(mockPrisma.spareparts.findMany).toHaveBeenCalledWith({
        where: expectedWhereClause,
        skip: undefined,
        take: undefined,
        orderBy: { modifiedOn: "desc" },
      });
      expect(mockPrisma.spareparts.count).toHaveBeenCalledWith({
        where: expectedWhereClause,
      });

      // Verify result
      expect(result).toEqual({
        spareparts: [mockSpareparts[1]],
        total: 1,
      });
    });

    it("should apply price range filters correctly", async () => {
      const filters: SparepartFilterOptions = {
        priceMin: 100,
        priceMax: 200,
      };
      const expectedWhereClause = {
        deletedOn: null,
        price: { gte: 100, lte: 200 },
      };

      // Setup mock
      (mockPrisma.spareparts.findMany as jest.Mock).mockResolvedValue(
        mockSpareparts,
      );
      (mockPrisma.spareparts.count as jest.Mock).mockResolvedValue(2);

      // Call the method
      const result = await sparepartRepository.getSpareparts(
        undefined,
        filters,
      );

      // Verify prisma method calls
      expect(mockPrisma.spareparts.findMany).toHaveBeenCalledWith({
        where: expectedWhereClause,
        skip: undefined,
        take: undefined,
        orderBy: { modifiedOn: "desc" },
      });
      expect(mockPrisma.spareparts.count).toHaveBeenCalledWith({
        where: expectedWhereClause,
      });

      // Verify result
      expect(result).toEqual({
        spareparts: mockSpareparts,
        total: 2,
      });
    });

    it("should apply only priceMin filter correctly", async () => {
      const filters: SparepartFilterOptions = {
        priceMin: 150,
      };
      const expectedWhereClause = {
        deletedOn: null,
        price: { gte: 150 },
      };

      // Setup mock
      (mockPrisma.spareparts.findMany as jest.Mock).mockResolvedValue([
        mockSpareparts[1],
      ]);
      (mockPrisma.spareparts.count as jest.Mock).mockResolvedValue(1);

      // Call the method
      const result = await sparepartRepository.getSpareparts(
        undefined,
        filters,
      );

      // Verify prisma method calls
      expect(mockPrisma.spareparts.findMany).toHaveBeenCalledWith({
        where: expectedWhereClause,
        skip: undefined,
        take: undefined,
        orderBy: { modifiedOn: "desc" },
      });
      expect(mockPrisma.spareparts.count).toHaveBeenCalledWith({
        where: expectedWhereClause,
      });

      // Verify result
      expect(result).toEqual({
        spareparts: [mockSpareparts[1]],
        total: 1,
      });
    });

    it("should apply only priceMax filter correctly", async () => {
      const filters: SparepartFilterOptions = {
        priceMax: 150,
      };
      const expectedWhereClause = {
        deletedOn: null,
        price: { lte: 150 },
      };

      // Setup mock
      (mockPrisma.spareparts.findMany as jest.Mock).mockResolvedValue([
        mockSpareparts[0],
      ]);
      (mockPrisma.spareparts.count as jest.Mock).mockResolvedValue(1);

      // Call the method
      const result = await sparepartRepository.getSpareparts(
        undefined,
        filters,
      );

      // Verify prisma method calls
      expect(mockPrisma.spareparts.findMany).toHaveBeenCalledWith({
        where: expectedWhereClause,
        skip: undefined,
        take: undefined,
        orderBy: { modifiedOn: "desc" },
      });
      expect(mockPrisma.spareparts.count).toHaveBeenCalledWith({
        where: expectedWhereClause,
      });

      // Verify result
      expect(result).toEqual({
        spareparts: [mockSpareparts[0]],
        total: 1,
      });
    });

    it("should apply purchaseDate range filters correctly", async () => {
      const purchaseDateStart = new Date("2023-01-01");
      const purchaseDateEnd = new Date("2023-02-28");

      const filters: SparepartFilterOptions = {
        purchaseDateStart,
        purchaseDateEnd,
      };

      const expectedWhereClause = {
        deletedOn: null,
        purchaseDate: {
          gte: purchaseDateStart,
          lte: purchaseDateEnd,
        },
      };

      // Setup mock
      (mockPrisma.spareparts.findMany as jest.Mock).mockResolvedValue(
        mockSpareparts,
      );
      (mockPrisma.spareparts.count as jest.Mock).mockResolvedValue(2);

      // Call the method
      const result = await sparepartRepository.getSpareparts(
        undefined,
        filters,
      );

      // Verify prisma method calls
      expect(mockPrisma.spareparts.findMany).toHaveBeenCalledWith({
        where: expectedWhereClause,
        skip: undefined,
        take: undefined,
        orderBy: { modifiedOn: "desc" },
      });
      expect(mockPrisma.spareparts.count).toHaveBeenCalledWith({
        where: expectedWhereClause,
      });

      // Verify result
      expect(result).toEqual({
        spareparts: mockSpareparts,
        total: 2,
      });
    });

    it("should apply createdOn range filters correctly", async () => {
      const createdOnStart = new Date("2023-02-01");
      const createdOnEnd = new Date("2023-02-28");

      const filters: SparepartFilterOptions = {
        createdOnStart,
        createdOnEnd,
      };

      const expectedWhereClause = {
        deletedOn: null,
        createdOn: {
          gte: createdOnStart,
          lte: createdOnEnd,
        },
      };

      // Setup mock
      (mockPrisma.spareparts.findMany as jest.Mock).mockResolvedValue([
        mockSpareparts[1],
      ]);
      (mockPrisma.spareparts.count as jest.Mock).mockResolvedValue(1);

      // Call the method
      const result = await sparepartRepository.getSpareparts(
        undefined,
        filters,
      );

      // Verify prisma method calls
      expect(mockPrisma.spareparts.findMany).toHaveBeenCalledWith({
        where: expectedWhereClause,
        skip: undefined,
        take: undefined,
        orderBy: { modifiedOn: "desc" },
      });
      expect(mockPrisma.spareparts.count).toHaveBeenCalledWith({
        where: expectedWhereClause,
      });

      // Verify result
      expect(result).toEqual({
        spareparts: [mockSpareparts[1]],
        total: 1,
      });
    });

    it("should apply modifiedOn range filters correctly", async () => {
      const modifiedOnStart = new Date("2023-02-01");
      const modifiedOnEnd = new Date("2023-02-28");

      const filters: SparepartFilterOptions = {
        modifiedOnStart,
        modifiedOnEnd,
      };

      const expectedWhereClause = {
        deletedOn: null,
        modifiedOn: {
          gte: modifiedOnStart,
          lte: modifiedOnEnd,
        },
      };

      // Setup mock
      (mockPrisma.spareparts.findMany as jest.Mock).mockResolvedValue([
        mockSpareparts[1],
      ]);
      (mockPrisma.spareparts.count as jest.Mock).mockResolvedValue(1);

      // Call the method
      const result = await sparepartRepository.getSpareparts(
        undefined,
        filters,
      );

      // Verify prisma method calls
      expect(mockPrisma.spareparts.findMany).toHaveBeenCalledWith({
        where: expectedWhereClause,
        skip: undefined,
        take: undefined,
        orderBy: { modifiedOn: "desc" },
      });
      expect(mockPrisma.spareparts.count).toHaveBeenCalledWith({
        where: expectedWhereClause,
      });

      // Verify result
      expect(result).toEqual({
        spareparts: [mockSpareparts[1]],
        total: 1,
      });
    });

    it("should apply pagination correctly", async () => {
      const pagination: PaginationOptions = {
        page: 2,
        limit: 1,
      };

      // Setup mock
      (mockPrisma.spareparts.findMany as jest.Mock).mockResolvedValue([
        mockSpareparts[1],
      ]);
      (mockPrisma.spareparts.count as jest.Mock).mockResolvedValue(2);

      // Call the method
      const result = await sparepartRepository.getSpareparts(
        undefined,
        undefined,
        pagination,
      );

      // Verify prisma method calls
      expect(mockPrisma.spareparts.findMany).toHaveBeenCalledWith({
        where: { deletedOn: null },
        skip: 1, // (page-1) * limit
        take: 1, // limit
        orderBy: { modifiedOn: "desc" },
      });
      expect(mockPrisma.spareparts.count).toHaveBeenCalledWith({
        where: { deletedOn: null },
      });

      // Verify result
      expect(result).toEqual({
        spareparts: [mockSpareparts[1]],
        total: 2,
      });
    });

    it("should apply combined search, filters, and pagination correctly", async () => {
      const searchTerm = "Test";
      const filters: SparepartFilterOptions = {
        priceMin: 100,
        toolLocation: "Location",
      };
      const pagination: PaginationOptions = {
        page: 1,
        limit: 10,
      };

      const expectedWhereClause = {
        deletedOn: null,
        OR: [
          { partsName: { contains: searchTerm } },
          { toolLocation: { contains: searchTerm } },
        ],
        toolLocation: { contains: "Location" },
        price: { gte: 100 },
      };

      // Setup mock
      (mockPrisma.spareparts.findMany as jest.Mock).mockResolvedValue(
        mockSpareparts,
      );
      (mockPrisma.spareparts.count as jest.Mock).mockResolvedValue(2);

      // Call the method
      const result = await sparepartRepository.getSpareparts(
        searchTerm,
        filters,
        pagination,
      );

      // Verify prisma method calls
      expect(mockPrisma.spareparts.findMany).toHaveBeenCalledWith({
        where: expectedWhereClause,
        skip: 0,
        take: 10,
        orderBy: { modifiedOn: "desc" },
      });
      expect(mockPrisma.spareparts.count).toHaveBeenCalledWith({
        where: expectedWhereClause,
      });

      // Verify result
      expect(result).toEqual({
        spareparts: mockSpareparts,
        total: 2,
      });
    });

    it("should handle empty result correctly", async () => {
      // Setup mock
      (mockPrisma.spareparts.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.spareparts.count as jest.Mock).mockResolvedValue(0);

      // Call the method
      const result = await sparepartRepository.getSpareparts();

      // Verify prisma method calls
      expect(mockPrisma.spareparts.findMany).toHaveBeenCalledWith({
        where: { deletedOn: null },
        skip: undefined,
        take: undefined,
        orderBy: { modifiedOn: "desc" },
      });

      // Verify result
      expect(result).toEqual({
        spareparts: [],
        total: 0,
      });
    });
  });

  describe("getSparepartById", () => {
    it("should return a sparepart when found by ID", async () => {
      const mockSparepart = {
        id: "1",
        partsName: "Test Part 1",
        purchaseDate: new Date("2023-01-15"),
        price: 100,
        toolLocation: "Location A",
        toolDate: "2023-01-20",
        createdBy: "user1",
        createdOn: new Date("2023-01-01"),
        modifiedOn: new Date("2023-01-01"),
        deletedOn: null,
      };

      // Setup mock
      (mockPrisma.spareparts.findFirst as jest.Mock).mockResolvedValue(
        mockSparepart,
      );

      // Call the method
      const result = await sparepartRepository.getSparepartById("1");

      // Verify prisma method call
      expect(mockPrisma.spareparts.findFirst).toHaveBeenCalledWith({
        where: { id: "1", deletedOn: null },
      });

      // Verify result
      expect(result).toEqual(mockSparepart);
    });

    it("should return null when sparepart is not found", async () => {
      // Setup mock
      (mockPrisma.spareparts.findFirst as jest.Mock).mockResolvedValue(null);

      // Call the method
      const result = await sparepartRepository.getSparepartById("nonexistent");

      // Verify prisma method call
      expect(mockPrisma.spareparts.findFirst).toHaveBeenCalledWith({
        where: { id: "nonexistent", deletedOn: null },
      });

      // Verify result
      expect(result).toBeNull();
    });

    it("should return null if the sparepart is deleted", async () => {
      // Setup mock - this mock should not actually return the sparepart
      // since the repository adds a deletedOn: null filter
      (mockPrisma.spareparts.findFirst as jest.Mock).mockResolvedValue(null);

      // Call the method
      const result = await sparepartRepository.getSparepartById("deleted-id");

      // Verify prisma method call includes deletedOn: null filter
      expect(mockPrisma.spareparts.findFirst).toHaveBeenCalledWith({
        where: { id: "deleted-id", deletedOn: null },
      });

      // Verify result
      expect(result).toBeNull();
    });
  });

  describe("getSparepartByName", () => {
    const mockSpareparts = [
      {
        id: "1",
        partsName: "Motor Gear",
        price: 100,
        toolLocation: "Storage A",
        createdOn: new Date("2023-01-01"),
        modifiedOn: new Date("2023-01-01"),
        deletedOn: null,
      },
      {
        id: "2",
        partsName: "Motor Controller",
        price: 200,
        toolLocation: "Storage B",
        createdOn: new Date("2023-02-01"),
        modifiedOn: new Date("2023-02-01"),
        deletedOn: null,
      },
    ];

    it("should return matching spareparts when found by name", async () => {
      const nameQuery = "Motor";

      // Setup mock to return both spareparts since both have "Motor" in their names
      (mockPrisma.spareparts.findMany as jest.Mock).mockResolvedValue(
        mockSpareparts,
      );

      // Call the method
      const result = await sparepartRepository.getSparepartByName(nameQuery);

      // Verify prisma method call with correct where clause
      expect(mockPrisma.spareparts.findMany).toHaveBeenCalledWith({
        where: {
          partsName: {
            contains: nameQuery,
          },
          deletedOn: null,
        },
      });

      // Verify result contains all matching spareparts
      expect(result).toEqual(mockSpareparts);
      expect(result.length).toBe(2);
    });

    it("should return specific matching sparepart with more precise name query", async () => {
      const nameQuery = "Gear";

      // Setup mock to return only the matching sparepart
      (mockPrisma.spareparts.findMany as jest.Mock).mockResolvedValue([
        mockSpareparts[0],
      ]);

      // Call the method
      const result = await sparepartRepository.getSparepartByName(nameQuery);

      // Verify prisma method call
      expect(mockPrisma.spareparts.findMany).toHaveBeenCalledWith({
        where: {
          partsName: {
            contains: nameQuery,
          },
          deletedOn: null,
        },
      });

      // Verify result contains only the matching sparepart
      expect(result).toEqual([mockSpareparts[0]]);
      expect(result.length).toBe(1);
      expect(result[0].partsName).toContain(nameQuery);
    });

    it("should return empty array when no spareparts match the name query", async () => {
      const nameQuery = "Nonexistent";

      // Setup mock to return empty array (no matches)
      (mockPrisma.spareparts.findMany as jest.Mock).mockResolvedValue([]);

      // Call the method
      const result = await sparepartRepository.getSparepartByName(nameQuery);

      // Verify prisma method call
      expect(mockPrisma.spareparts.findMany).toHaveBeenCalledWith({
        where: {
          partsName: {
            contains: nameQuery,
          },
          deletedOn: null,
        },
      });

      // Verify result is empty array
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it("should ignore deleted spareparts when searching by name", async () => {
      const nameQuery = "Motor";

      // Setup mock - repository already filters by deletedOn: null
      (mockPrisma.spareparts.findMany as jest.Mock).mockResolvedValue(
        mockSpareparts,
      );

      // Call the method
      const result = await sparepartRepository.getSparepartByName(nameQuery);

      // Verify prisma method call includes deletedOn: null filter
      expect(mockPrisma.spareparts.findMany).toHaveBeenCalledWith({
        where: {
          partsName: {
            contains: nameQuery,
          },
          deletedOn: null,
        },
      });

      // All returned spareparts should have deletedOn: null
      result.forEach((sparepart) => {
        expect(sparepart.deletedOn).toBeNull();
      });
    });
  });
});
