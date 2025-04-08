// __tests__/unit/services/sparepart/sparepart.service.unit.test.ts
import SparepartService from "../../../../src/services/sparepart.service";
import SparepartRepository from "../../../../src/repository/sparepart.repository";

// Mock the repository
jest.mock("../../../../src/repository/sparepart.repository");

describe("SparepartService", () => {
  let sparepartService: SparepartService;
  let mockSparepartRepository: jest.Mocked<SparepartRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock repository
    mockSparepartRepository =
      new SparepartRepository() as jest.Mocked<SparepartRepository>;

    // Create service instance with mocked repository
    sparepartService = new SparepartService();
    (sparepartService as any).sparepartRepository = mockSparepartRepository;
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

      mockSparepartRepository.getSpareparts = jest
        .fn()
        .mockResolvedValue(mockSpareparts);

      const result = await sparepartService.getSpareparts();

      expect(mockSparepartRepository.getSpareparts).toHaveBeenCalled();
      expect(result).toEqual(mockSpareparts);
    });

    it("should throw an error if repository fails", async () => {
      const errorMessage = "Database error";
      mockSparepartRepository.getSpareparts = jest
        .fn()
        .mockRejectedValue(new Error(errorMessage));

      await expect(sparepartService.getSpareparts()).rejects.toThrow(
        errorMessage,
      );
    });
  });

  describe("getFilteredSpareparts", () => {
    it("should apply filters when provided", async () => {
      const mockSpareparts = [
        {
          id: "1",
          partsName: "Test Part 1",
          purchaseDate: new Date("2025-01-01"),
          price: 100,
          toolLocation: "Location 1",
          toolDate: "2025-03-24",
        },
      ];

      // Mock the getFilteredSpareparts repository method
      mockSparepartRepository.getFilteredSpareparts = jest
        .fn()
        .mockResolvedValue(mockSpareparts);

      // Create test filters
      const filters = {
        partsName: "Test",
        purchaseDateStart: "2025-01-01",
        purchaseDateEnd: "2025-12-31",
        priceMin: 50,
        priceMax: 150,
        toolLocation: "Location",
      };

      const result = await sparepartService.getFilteredSpareparts(filters);

      // Verify the repository was called with the correct where clause
      expect(
        mockSparepartRepository.getFilteredSpareparts,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          partsName: expect.objectContaining({
            contains: "Test",
          }),
          purchaseDate: expect.objectContaining({
            gte: expect.any(Date),
            lte: expect.any(Date),
          }),
          price: expect.objectContaining({
            gte: 50,
            lte: 150,
          }),
          toolLocation: expect.objectContaining({
            contains: "Location",
          }),
        }),
      );

      expect(result).toEqual(mockSpareparts);
    });

    it("should handle partial filters", async () => {
      const mockSpareparts = [
        {
          id: "2",
          partsName: "Test Part 2",
          purchaseDate: new Date("2025-02-01"),
          price: 200,
          toolLocation: "Location 2",
          toolDate: "2025-03-24",
        },
      ];

      mockSparepartRepository.getFilteredSpareparts = jest
        .fn()
        .mockResolvedValue(mockSpareparts);

      // Create partial filters (only some properties)
      const filters = {
        partsName: "Test",
        priceMin: 150,
      };

      const result = await sparepartService.getFilteredSpareparts(filters);

      // Verify only the provided filters were used
      expect(
        mockSparepartRepository.getFilteredSpareparts,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          partsName: expect.objectContaining({
            contains: "Test",
          }),
          price: expect.objectContaining({
            gte: 150,
          }),
        }),
      );

      // Verify that other filters were not included
      const whereClause = (
        mockSparepartRepository.getFilteredSpareparts as jest.Mock
      ).mock.calls[0][0];
      expect(whereClause.purchaseDate).toBeUndefined();
      expect(whereClause.toolLocation).toBeUndefined();

      expect(result).toEqual(mockSpareparts);
    });

    it("should handle empty filters", async () => {
      const mockSpareparts = [
        {
          id: "1",
          partsName: "Test Part 1",
          purchaseDate: new Date(),
          price: 100,
          toolLocation: "Location 1",
          toolDate: "2025-03-24",
        },
      ];

      mockSparepartRepository.getFilteredSpareparts = jest
        .fn()
        .mockResolvedValue(mockSpareparts);

      // Empty filters object
      const filters = {};

      const result = await sparepartService.getFilteredSpareparts(filters);

      // Verify an empty where clause was passed
      expect(
        mockSparepartRepository.getFilteredSpareparts,
      ).toHaveBeenCalledWith({});
      expect(result).toEqual(mockSpareparts);
    });

    it("should throw an error if repository fails", async () => {
      const errorMessage = "Database error";
      mockSparepartRepository.getFilteredSpareparts = jest
        .fn()
        .mockRejectedValue(new Error(errorMessage));

      await expect(sparepartService.getFilteredSpareparts({})).rejects.toThrow(
        errorMessage,
      );
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

      mockSparepartRepository.getSparepartById = jest
        .fn()
        .mockResolvedValue(mockSparepart);

      const result = await sparepartService.getSparepartById("1");

      expect(mockSparepartRepository.getSparepartById).toHaveBeenCalledWith(
        "1",
      );
      expect(result).toEqual(mockSparepart);
    });

    it("should return null if sparepart not found", async () => {
      mockSparepartRepository.getSparepartById = jest
        .fn()
        .mockResolvedValue(null);

      const result = await sparepartService.getSparepartById("999");

      expect(mockSparepartRepository.getSparepartById).toHaveBeenCalledWith(
        "999",
      );
      expect(result).toBeNull();
    });

    it("should throw an error if repository fails", async () => {
      const errorMessage = "Database error";
      mockSparepartRepository.getSparepartById = jest
        .fn()
        .mockRejectedValue(new Error(errorMessage));

      await expect(sparepartService.getSparepartById("1")).rejects.toThrow(
        errorMessage,
      );
    });
  });
});
