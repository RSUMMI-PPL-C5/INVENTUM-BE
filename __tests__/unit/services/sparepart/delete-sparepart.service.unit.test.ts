import SparepartService from "../../../../src/services/sparepart.service";
import SparepartRepository from "../../../../src/repository/sparepart.repository";
import { SparepartsDTO } from "../../../../src/dto/sparepart.dto";

jest.mock("../../../../src/repository/sparepart.repository");

describe("SparepartService - DELETE", () => {
  let sparepartService: SparepartService;
  let mockSparepartRepository: jest.Mocked<SparepartRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSparepartRepository =
      new SparepartRepository() as jest.Mocked<SparepartRepository>;
    sparepartService = new SparepartService();
    (sparepartService as any).sparepartRepository = mockSparepartRepository;
  });

  describe("deleteSparepart", () => {
    it("should delete a sparepart by id", async () => {
      const mockSparepart: SparepartsDTO = {
        id: "1",
        partsName: "Test Part",
        purchaseDate: new Date("2023-01-01"),
        price: 100,
        toolLocation: "Warehouse A",
        toolDate: new Date("2023-01-05").toISOString(),
        createdBy: 1,
        createdOn: new Date("2023-01-01"),
        modifiedOn: new Date("2023-01-01"),
        deletedOn: new Date(),
      };

      mockSparepartRepository.getSparepartById.mockResolvedValue(mockSparepart);
      mockSparepartRepository.deleteSparepart.mockResolvedValue(mockSparepart);

      const result = await sparepartService.deleteSparepart("1");

      expect(mockSparepartRepository.getSparepartById).toHaveBeenCalledWith(
        "1",
      );
      expect(mockSparepartRepository.deleteSparepart).toHaveBeenCalledWith("1");
      expect(result).toEqual(mockSparepart);
    });

    it("should return null if sparepart not found", async () => {
      mockSparepartRepository.getSparepartById.mockResolvedValue(null);

      const result = await sparepartService.deleteSparepart("999");

      expect(mockSparepartRepository.getSparepartById).toHaveBeenCalledWith(
        "999",
      );
      expect(mockSparepartRepository.deleteSparepart).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("should handle errors", async () => {
      const mockSparepart: SparepartsDTO = {
        id: "1",
        partsName: "Test Part",
        purchaseDate: new Date("2023-01-01"),
        price: 100,
        toolLocation: "Warehouse A",
        toolDate: new Date("2023-01-05").toISOString(),
        createdBy: 1,
        createdOn: new Date("2023-01-01"),
        modifiedOn: new Date("2023-01-01"),
      };

      mockSparepartRepository.getSparepartById.mockResolvedValue(mockSparepart);

      const errorMessage = "Database error";
      mockSparepartRepository.deleteSparepart.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(sparepartService.deleteSparepart("1")).rejects.toThrow(
        errorMessage,
      );
      expect(mockSparepartRepository.getSparepartById).toHaveBeenCalledWith(
        "1",
      );
      expect(mockSparepartRepository.deleteSparepart).toHaveBeenCalledWith("1");
    });
  });
});
