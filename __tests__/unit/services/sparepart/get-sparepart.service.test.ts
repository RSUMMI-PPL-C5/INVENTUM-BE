import SparepartService from "../../../../src/services/sparepart.service";
import SparepartRepository from "../../../../src/repository/sparepart.repository";
import AppError from "../../../../src/utils/appError";
import { SparepartDTO } from "../../../../src/dto/sparepart.dto";
import { PaginationOptions } from "../../../../src/interfaces/pagination.interface";
import { SparepartFilterOptions } from "../../../../src/interfaces/spareparts.filter.interface";
import { Spareparts } from "@prisma/client";

jest.mock("../../../../src/repository/sparepart.repository");

describe("SparepartService - Get Methods", () => {
  let sparepartService: SparepartService;
  let sparepartRepositoryMock: jest.Mocked<SparepartRepository>;

  beforeEach(() => {
    sparepartRepositoryMock =
      new SparepartRepository() as jest.Mocked<SparepartRepository>;
    sparepartService = new SparepartService();
    (sparepartService as any).sparepartRepository = sparepartRepositoryMock;
  });

  describe("getSpareparts", () => {
    it("should return spareparts with metadata - no parameters", async () => {
      const mockSpareparts: Spareparts[] = [
        {
          id: "1",
          partsName: "Test Part 1",
          purchaseDate: new Date(),
          price: 100,
          toolLocation: "Location A",
          toolDate: "2024-03-20",
          imageUrl: null,
          createdBy: "user123",
          createdOn: new Date(),
          modifiedBy: null,
          modifiedOn: new Date(),
          deletedBy: null,
          deletedOn: null,
        },
        {
          id: "2",
          partsName: "Test Part 2",
          purchaseDate: new Date(),
          price: 200,
          toolLocation: "Location B",
          toolDate: "2024-03-21",
          imageUrl: null,
          createdBy: "user123",
          createdOn: new Date(),
          modifiedBy: null,
          modifiedOn: new Date(),
          deletedBy: null,
          deletedOn: null,
        },
      ];

      sparepartRepositoryMock.getSpareparts.mockResolvedValue({
        spareparts: mockSpareparts,
        total: mockSpareparts.length,
      });

      const result = await sparepartService.getSpareparts();

      expect(sparepartRepositoryMock.getSpareparts).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
      );
      expect(result).toEqual({
        data: mockSpareparts,
        meta: {
          total: mockSpareparts.length,
          page: 1,
          limit: mockSpareparts.length,
          totalPages: 1,
        },
      });
    });

    it("should apply search parameter", async () => {
      const search = "test";
      const mockSpareparts: Spareparts[] = [
        {
          id: "1",
          partsName: "Test Part",
          price: 100,
          purchaseDate: new Date(),
          toolLocation: "Location A",
          toolDate: "2024-03-20",
          imageUrl: null,
          createdBy: "user123",
          createdOn: new Date(),
          modifiedBy: null,
          modifiedOn: new Date(),
          deletedBy: null,
          deletedOn: null,
        },
      ];

      sparepartRepositoryMock.getSpareparts.mockResolvedValue({
        spareparts: mockSpareparts,
        total: 1,
      });

      const result = await sparepartService.getSpareparts(search);

      expect(sparepartRepositoryMock.getSpareparts).toHaveBeenCalledWith(
        search,
        undefined,
        undefined,
      );
      expect(result).toEqual({
        data: mockSpareparts,
        meta: {
          total: 1,
          page: 1,
          limit: 1,
          totalPages: 1,
        },
      });
    });

    it("should apply filters and pagination", async () => {
      const filters: SparepartFilterOptions = {
        toolLocation: "Warehouse A",
      };
      const pagination: PaginationOptions = { page: 1, limit: 10 };
      const mockSpareparts: Spareparts[] = [
        {
          id: "1",
          partsName: "Filtered Part",
          price: 150,
          purchaseDate: new Date(),
          toolLocation: "Location A",
          toolDate: "2024-03-20",
          imageUrl: null,
          createdBy: "user123",
          createdOn: new Date(),
          modifiedBy: null,
          modifiedOn: new Date(),
          deletedBy: null,
          deletedOn: null,
        },
      ];

      sparepartRepositoryMock.getSpareparts.mockResolvedValue({
        spareparts: mockSpareparts,
        total: 1,
      });

      const result = await sparepartService.getSpareparts(
        undefined,
        filters,
        pagination,
      );

      expect(sparepartRepositoryMock.getSpareparts).toHaveBeenCalledWith(
        undefined,
        filters,
        pagination,
      );
      expect(result).toEqual({
        data: mockSpareparts,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it("should return spareparts with pagination", async () => {
      const mockSpareparts: Spareparts[] = [
        {
          id: "1",
          partsName: "Test Part 1",
          purchaseDate: new Date(),
          price: 100,
          toolLocation: "Location A",
          toolDate: "2024-03-20",
          imageUrl: null,
          createdBy: "user123",
          createdOn: new Date(),
          modifiedBy: null,
          modifiedOn: new Date(),
          deletedBy: null,
          deletedOn: null,
        },
        {
          id: "2",
          partsName: "Test Part 2",
          purchaseDate: new Date(),
          price: 200,
          toolLocation: "Location B",
          toolDate: "2024-03-21",
          imageUrl: null,
          createdBy: "user123",
          createdOn: new Date(),
          modifiedBy: null,
          modifiedOn: new Date(),
          deletedBy: null,
          deletedOn: null,
        },
      ];

      const mockSparepartsWithImageUrl = mockSpareparts.map((sparepart) => ({
        ...sparepart,
        imageUrl: sparepart.imageUrl ?? null,
      }));

      sparepartRepositoryMock.getSpareparts.mockResolvedValue({
        spareparts: mockSparepartsWithImageUrl,
        total: mockSpareparts.length,
      });

      const paginationOptions: PaginationOptions = {
        page: 1,
        limit: 10,
      };

      const result = await sparepartService.getSpareparts(
        undefined,
        undefined,
        paginationOptions,
      );

      expect(result).toEqual({
        data: mockSparepartsWithImageUrl,
        meta: {
          total: mockSpareparts.length,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it("should handle empty spareparts list", async () => {
      sparepartRepositoryMock.getSpareparts.mockResolvedValue({
        spareparts: [],
        total: 0,
      });

      const paginationOptions: PaginationOptions = {
        page: 1,
        limit: 10,
      };

      const result = await sparepartService.getSpareparts(
        undefined,
        undefined,
        paginationOptions,
      );

      expect(result).toEqual({
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      });
    });

    it("should handle search parameter", async () => {
      const mockSpareparts: Spareparts[] = [
        {
          id: "1",
          partsName: "Test Part 1",
          purchaseDate: new Date(),
          price: 100,
          toolLocation: "Location A",
          toolDate: "2024-03-20",
          imageUrl: null,
          createdBy: "user123",
          createdOn: new Date(),
          modifiedBy: null,
          modifiedOn: new Date(),
          deletedBy: null,
          deletedOn: null,
        },
      ];

      const mockSparepartsWithImageUrl = mockSpareparts.map((sparepart) => ({
        ...sparepart,
        imageUrl: sparepart.imageUrl ?? null,
      }));

      sparepartRepositoryMock.getSpareparts.mockResolvedValue({
        spareparts: mockSparepartsWithImageUrl,
        total: mockSpareparts.length,
      });

      const paginationOptions: PaginationOptions = {
        page: 1,
        limit: 10,
      };

      const result = await sparepartService.getSpareparts(
        "Test",
        undefined,
        paginationOptions,
      );

      expect(result).toEqual({
        data: mockSparepartsWithImageUrl,
        meta: {
          total: mockSpareparts.length,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it("should handle filters", async () => {
      const mockSpareparts: Spareparts[] = [
        {
          id: "1",
          partsName: "Test Part 1",
          purchaseDate: new Date(),
          price: 100,
          toolLocation: "Location A",
          toolDate: "2024-03-20",
          imageUrl: null,
          createdBy: "user123",
          createdOn: new Date(),
          modifiedBy: null,
          modifiedOn: new Date(),
          deletedBy: null,
          deletedOn: null,
        },
      ];

      const mockSparepartsWithImageUrl = mockSpareparts.map((sparepart) => ({
        ...sparepart,
        imageUrl: sparepart.imageUrl ?? null,
      }));

      sparepartRepositoryMock.getSpareparts.mockResolvedValue({
        spareparts: mockSparepartsWithImageUrl,
        total: mockSpareparts.length,
      });

      const paginationOptions: PaginationOptions = {
        page: 1,
        limit: 10,
      };

      const filters: SparepartFilterOptions = {
        partsName: "Test",
        priceMin: 50,
        priceMax: 150,
      };

      const result = await sparepartService.getSpareparts(
        undefined,
        filters,
        paginationOptions,
      );

      expect(result).toEqual({
        data: mockSparepartsWithImageUrl,
        meta: {
          total: mockSpareparts.length,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it("should handle repository error", async () => {
      sparepartRepositoryMock.getSpareparts.mockRejectedValue(
        new Error("Database error"),
      );

      const paginationOptions: PaginationOptions = {
        page: 1,
        limit: 10,
      };

      await expect(
        sparepartService.getSpareparts(undefined, undefined, paginationOptions),
      ).rejects.toThrow("Database error");
    });
  });

  describe("getSparepartById", () => {
    it("should return sparepart when found by ID", async () => {
      const id = "valid-id";
      const mockSparepart: Spareparts = {
        id,
        partsName: "Test Part",
        purchaseDate: new Date("2022-01-01"),
        price: 100,
        toolLocation: "Warehouse A",
        toolDate: "2024-03-20",
        imageUrl: null,
        createdBy: "user123",
        createdOn: new Date(),
        modifiedBy: "user456",
        modifiedOn: new Date(),
        deletedBy: null,
        deletedOn: null,
      };

      sparepartRepositoryMock.getSparepartById.mockResolvedValue(mockSparepart);

      const result = await sparepartService.getSparepartById(id);

      expect(sparepartRepositoryMock.getSparepartById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockSparepart);
    });

    it("should throw an error if ID is invalid", async () => {
      await expect(sparepartService.getSparepartById("")).rejects.toThrow(
        "Sparepart ID is required and must be a valid string",
      );
      expect(sparepartRepositoryMock.getSparepartById).not.toHaveBeenCalled();
    });

    it("should return null if sparepart is not found", async () => {
      sparepartRepositoryMock.getSparepartById.mockResolvedValue(null);

      const result = await sparepartService.getSparepartById("non-existent-id");

      expect(sparepartRepositoryMock.getSparepartById).toHaveBeenCalledWith(
        "non-existent-id",
      );
      expect(result).toBeNull();
    });
  });

  describe("getSparepartByName", () => {
    it("should return spareparts matching the name query", async () => {
      const nameQuery = "Test Part";
      const mockSpareparts: Spareparts[] = [
        {
          id: "1",
          partsName: "Test Part",
          price: 100,
          purchaseDate: new Date(),
          toolLocation: "Location A",
          toolDate: "2024-03-20",
          imageUrl: null,
          createdBy: "user123",
          createdOn: new Date(),
          modifiedBy: null,
          modifiedOn: new Date(),
          deletedBy: null,
          deletedOn: null,
        },
      ];

      sparepartRepositoryMock.getSparepartByName.mockResolvedValue(
        mockSpareparts,
      );

      const result = await sparepartService.getSparepartByName(nameQuery);

      expect(sparepartRepositoryMock.getSparepartByName).toHaveBeenCalledWith(
        nameQuery,
      );
      expect(result).toEqual(mockSpareparts);
    });

    it("should throw an error if name query is invalid", async () => {
      await expect(sparepartService.getSparepartByName("")).rejects.toThrow(
        "Name query is required and must be a valid string",
      );
      expect(sparepartRepositoryMock.getSparepartByName).not.toHaveBeenCalled();
    });
  });
});
