import SparepartService from "../../../../src/services/sparepart.service";
import SparepartRepository from "../../../../src/repository/sparepart.repository";
import { SparepartDTO } from "../../../../src/dto/sparepart.dto";

jest.mock("../../../../src/repository/sparepart.repository");

describe("SparepartService - UPDATE", () => {
  let sparepartService: SparepartService;
  let mockSparepartRepository: jest.Mocked<SparepartRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSparepartRepository =
      new SparepartRepository() as jest.Mocked<SparepartRepository>;
    sparepartService = new SparepartService();
    (sparepartService as any).sparepartRepository = mockSparepartRepository;
  });

  const baseSparepart: SparepartDTO = {
    id: "1",
    partsName: "Original Part",
    purchaseDate: new Date("2023-01-01"),
    price: 100,
    toolLocation: "Warehouse A",
    toolDate: new Date("2023-01-05").toISOString(),
    createdBy: 1,
    createdOn: new Date("2023-01-01"),
    modifiedBy: null,
    modifiedOn: new Date("2023-01-01"),
    deletedBy: null,
    deletedOn: null,
  };

  describe("updateSparepart", () => {
    it("should update a sparepart successfully", async () => {
      const updatedData: Partial<SparepartDTO> = {
        partsName: "Updated Part",
        price: 150,
        modifiedBy: 2,
      };

      const updatedSparepart: SparepartDTO = {
        ...baseSparepart,
        partsName: "Updated Part",
        price: 150,
        modifiedBy: 2,
        modifiedOn: expect.any(Date) as unknown as Date,
      };

      mockSparepartRepository.getSparepartById.mockResolvedValue(baseSparepart);
      mockSparepartRepository.updateSparepart.mockResolvedValue(updatedSparepart);

      const result = await sparepartService.updateSparepart("1", updatedData);

      expect(mockSparepartRepository.getSparepartById).toHaveBeenCalledWith("1");
      expect(mockSparepartRepository.updateSparepart).toHaveBeenCalledWith("1", {
        partsName: updatedData.partsName,
        purchaseDate: updatedData.purchaseDate,
        price: updatedData.price,
        toolLocation: updatedData.toolLocation,
        toolDate: updatedData.toolDate,
        modifiedBy: updatedData.modifiedBy,
        modifiedOn: expect.any(Date),
      });
      expect(result).toEqual(updatedSparepart);
    });

    it("should return null if sparepart not found", async () => {
      mockSparepartRepository.getSparepartById.mockResolvedValue(null);

      const result = await sparepartService.updateSparepart("999", {
        partsName: "Updated Part",
        modifiedBy: 2,
      });

      expect(mockSparepartRepository.getSparepartById).toHaveBeenCalledWith("999");
      expect(mockSparepartRepository.updateSparepart).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("should return null if data is invalid", async () => {
      const invalidData: Partial<SparepartDTO> = {
        partsName: "Updated Part",
        price: 150,
      };

      mockSparepartRepository.getSparepartById.mockResolvedValue(baseSparepart);

      const result = await sparepartService.updateSparepart("1", invalidData);

      expect(mockSparepartRepository.getSparepartById).toHaveBeenCalledWith("1");
      expect(mockSparepartRepository.updateSparepart).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("should return null if price is negative", async () => {
      const invalidData: Partial<SparepartDTO> = {
        partsName: "Updated Part",
        price: -50,
        modifiedBy: 2,
      };

      mockSparepartRepository.getSparepartById.mockResolvedValue(baseSparepart);

      const result = await sparepartService.updateSparepart("1", invalidData);

      expect(mockSparepartRepository.getSparepartById).toHaveBeenCalledWith("1");
      expect(mockSparepartRepository.updateSparepart).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("should return null if partsName is empty", async () => {
      const invalidData: Partial<SparepartDTO> = {
        partsName: "   ",
        modifiedBy: 2,
      };

      mockSparepartRepository.getSparepartById.mockResolvedValue(baseSparepart);

      const result = await sparepartService.updateSparepart("1", invalidData);

      expect(mockSparepartRepository.getSparepartById).toHaveBeenCalledWith("1");
      expect(mockSparepartRepository.updateSparepart).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("validateSparepartData", () => {
    it("should return true for valid data", () => {
      const validData: Partial<SparepartDTO> = {
        partsName: "Valid Part",
        price: 100,
        modifiedBy: 1,
      };

      const result = (sparepartService as any).validateSparepartData(validData);

      expect(result).toBe(true);
    });

    it("should return false if modifiedBy is undefined", () => {
      const invalidData: Partial<SparepartDTO> = {
        partsName: "Valid Part",
        price: 100,
      };

      const result = (sparepartService as any).validateSparepartData(invalidData);

      expect(result).toBe(false);
    });

    it("should return false if partsName is empty", () => {
      const invalidData: Partial<SparepartDTO> = {
        partsName: "  ",
        price: 100,
        modifiedBy: 1,
      };

      const result = (sparepartService as any).validateSparepartData(invalidData);

      expect(result).toBe(false);
    });

    it("should return false if price is negative", () => {
      const invalidData: Partial<SparepartDTO> = {
        partsName: "Valid Part",
        price: -10,
        modifiedBy: 1,
      };

      const result = (sparepartService as any).validateSparepartData(invalidData);

      expect(result).toBe(false);
    });
  });
});
