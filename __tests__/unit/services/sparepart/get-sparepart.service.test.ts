import SparepartService from "../../../../src/services/sparepart.service";
import SparepartRepository from "../../../../src/repository/sparepart.repository";
import AppError from "../../../../src/utils/appError";
import { SparepartDTO } from "../../../../src/dto/sparepart.dto";
import { PaginationOptions } from "../../../../src/interfaces/pagination.interface";
import { SparepartFilterOptions } from "../../../../src/interfaces/spareparts.filter.interface";

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
      const mockSpareparts = [
        {
          id: "1",
          partsName: "Part 1",
          price: 100,
          purchaseDate: null,
          toolLocation: null,
          toolDate: null,
          createdBy: "user123",
          createdOn: new Date(),
          modifiedBy: null,
          modifiedOn: new Date(),
          deletedBy: null,
          deletedOn: null,
        },
        {
          id: "2",
          partsName: "Part 2",
          price: 200,
          purchaseDate: null,
          toolLocation: null,
          toolDate: null,
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
        total: 2,
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
          total: 2,
          page: 1,
          limit: 2,
          totalPages: 1,
        },
      });
    });

    it("should apply search parameter", async () => {
      const search = "test";
      const mockSpareparts = [
        {
          id: "1",
          partsName: "Test Part",
          price: 100,
          purchaseDate: null,
          toolLocation: null,
          toolDate: null,
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
      const mockSpareparts = [
        {
          id: "1",
          partsName: "Filtered Part",
          price: 150,
          purchaseDate: null,
          toolLocation: null,
          toolDate: null,
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
  });

  describe("getSparepartById", () => {
    it("should return sparepart when found by ID", async () => {
      const id = "valid-id";
      const mockSparepart: SparepartDTO = {
        id,
        partsName: "Test Part",
        purchaseDate: new Date("2022-01-01"),
        price: 100,
        toolLocation: "Warehouse A",
        toolDate: null,
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
        new AppError(
          "Sparepart ID is required and must be a valid string",
          400,
        ),
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
      const mockSpareparts: SparepartDTO[] = [
        {
          id: "1",
          partsName: "Test Part",
          price: 100,
          purchaseDate: null,
          toolLocation: null,
          toolDate: null,
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
        new AppError("Name query is required and must be a valid string", 400),
      );
      expect(sparepartRepositoryMock.getSparepartByName).not.toHaveBeenCalled();
    });
  });
});
