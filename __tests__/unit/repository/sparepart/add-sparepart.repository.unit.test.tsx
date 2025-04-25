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
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    },
  };
});

// Mock the date utils
jest.mock("../../../../src/utils/date.utils", () => ({
  getJakartaTime: jest.fn(),
}));

describe("SparepartRepository - CREATE", () => {
  let sparepartRepository: SparepartRepository;
  let mockPrisma: jest.Mocked<PrismaClient>;
  const mockJakartaTime = new Date("2023-01-15T00:00:00Z");

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = prisma as unknown as jest.Mocked<PrismaClient>;
    sparepartRepository = new SparepartRepository();

    jest.spyOn(dateUtils, "getJakartaTime").mockReturnValue(mockJakartaTime);
  });

  describe("createSparepart", () => {
    it("should create a new sparepart successfully and set timestamps", async () => {
      // Input data without timestamps
      const sparepartInput = {
        id: "mock-id",
        partsName: "Test Part",
        purchaseDate: new Date("2023-01-01"),
        price: 100,
        toolLocation: "Warehouse A",
        toolDate: "2023-01-05",
        createdBy: "1",
      };

      const expectedCreateInput = {
        ...sparepartInput,
        createdOn: mockJakartaTime,
        modifiedOn: mockJakartaTime,
      };

      const mockCreatedSparepart = {
        ...expectedCreateInput,
        id: "mock-id",
      };

      (mockPrisma.spareparts.create as jest.Mock).mockResolvedValue(
        mockCreatedSparepart,
      );

      const result = await sparepartRepository.createSparepart(sparepartInput);

      expect(mockPrisma.spareparts.create).toHaveBeenCalledWith({
        data: expectedCreateInput,
      });

      expect(result).toEqual(mockCreatedSparepart);
      expect(dateUtils.getJakartaTime).toHaveBeenCalled();
    });

    it("should override any provided timestamps with Jakarta time", async () => {
      const inputWithTimestamps = {
        id: "mock-id",
        partsName: "Test Part",
        price: 100,
        createdBy: "1",
        createdOn: new Date("2020-01-01"),
        modifiedOn: new Date("2020-01-01"),
      };

      const expectedCreateInput = {
        ...inputWithTimestamps,
        createdOn: mockJakartaTime,
        modifiedOn: mockJakartaTime,
      };

      const mockResponse = {
        ...expectedCreateInput,
        id: "mock-id",
      };

      (mockPrisma.spareparts.create as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      const result =
        await sparepartRepository.createSparepart(inputWithTimestamps);

      expect(mockPrisma.spareparts.create).toHaveBeenCalledWith({
        data: expectedCreateInput,
      });
      expect(result.createdOn).toEqual(mockJakartaTime);
      expect(result.modifiedOn).toEqual(mockJakartaTime);
    });

    it("should handle minimal required fields", async () => {
      const minimalInput = {
        id: "minimal-id",
        partsName: "Minimal Part",
        createdBy: "1",
      };

      const expectedCreateInput = {
        ...minimalInput,
        createdOn: mockJakartaTime,
        modifiedOn: mockJakartaTime,
      };

      const mockResponse = {
        ...expectedCreateInput,
        purchaseDate: null,
        price: null,
        toolLocation: null,
        toolDate: null,
      };

      (mockPrisma.spareparts.create as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      const result = await sparepartRepository.createSparepart(minimalInput);

      expect(mockPrisma.spareparts.create).toHaveBeenCalledWith({
        data: expectedCreateInput,
      });
      expect(result).toEqual(mockResponse);
    });

    it("should handle errors when creating a sparepart", async () => {
      const sparepartInput = {
        id: "mock-id",
        partsName: "Test Part",
        createdBy: "1",
      };

      const errorMessage = "Database error";
      (mockPrisma.spareparts.create as jest.Mock).mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(
        sparepartRepository.createSparepart(sparepartInput),
      ).rejects.toThrow(errorMessage);

      expect(mockPrisma.spareparts.create).toHaveBeenCalledWith({
        data: {
          ...sparepartInput,
          createdOn: mockJakartaTime,
          modifiedOn: mockJakartaTime,
        },
      });
    });
  });
});
