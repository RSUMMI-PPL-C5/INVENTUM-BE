import { Request, Response } from "express";
import SparepartController from "../../../../src/controllers/sparepart.controller";
import SparepartService from "../../../../src/services/sparepart.service";
import { SparepartsDTO } from "../../../../src/dto/sparepart.dto";

// Mock SparepartService
jest.mock("../../../../src/services/sparepart.service");

describe("SparepartController - DELETE", () => {
  let sparepartController: SparepartController;
  let mockSparepartService: jest.Mocked<SparepartService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock service
    mockSparepartService =
      new SparepartService() as jest.Mocked<SparepartService>;
    sparepartController = new SparepartController();
    (sparepartController as any).sparepartService = mockSparepartService;

    // Setup mock request and response
    jsonMock = jest.fn().mockReturnThis();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {
      params: { id: "1" },
    };
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
  });

  describe("deleteSparepart", () => {
    it("should delete a sparepart successfully", async () => {
      const mockDeletedSparepart: SparepartsDTO = {
        id: "1",
        partsName: "Test Part",
        purchaseDate: new Date("2023-01-01"),
        price: 100,
        toolLocation: "Warehouse A",
        toolDate: "2023-01-05",
        createdBy: 1,
        createdOn: new Date("2023-01-01"),
        modifiedOn: new Date("2023-01-01"),
        deletedOn: new Date(),
      } as SparepartsDTO;

      mockSparepartService.deleteSparepart = jest
        .fn()
        .mockResolvedValue(mockDeletedSparepart);

      await sparepartController.deleteSparepart(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockSparepartService.deleteSparepart).toHaveBeenCalledWith("1");
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Sparepart deleted successfully",
      });
    });

    it("should return 404 if sparepart not found", async () => {
      mockSparepartService.deleteSparepart = jest.fn().mockResolvedValue(null);

      await sparepartController.deleteSparepart(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockSparepartService.deleteSparepart).toHaveBeenCalledWith("1");
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Sparepart not found" });
    });

    it("should return 500 if service throws an error", async () => {
      const errorMessage = "Service error";
      mockSparepartService.deleteSparepart = jest
        .fn()
        .mockRejectedValue(new Error(errorMessage));

      await sparepartController.deleteSparepart(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockSparepartService.deleteSparepart).toHaveBeenCalledWith("1");
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ message: errorMessage });
    });

    it("should use the id from request params", async () => {
      mockRequest.params = { id: "custom-id-123" };
      mockSparepartService.deleteSparepart = jest
        .fn()
        .mockResolvedValue({} as SparepartsDTO);

      await sparepartController.deleteSparepart(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockSparepartService.deleteSparepart).toHaveBeenCalledWith(
        "custom-id-123",
      );
    });

    it("should return success message even if service returns sparepart data", async () => {
      const mockDeletedSparepart: SparepartsDTO = {
        id: "1",
        partsName: "Test Part",
        purchaseDate: new Date("2023-01-01"),
        price: 100,
        toolLocation: "Warehouse A",
        toolDate: "2023-01-05",
        createdBy: 1,
        createdOn: new Date("2023-01-01"),
        modifiedOn: new Date("2023-01-01"),
        deletedOn: new Date(),
      } as SparepartsDTO;

      mockSparepartService.deleteSparepart = jest
        .fn()
        .mockResolvedValue(mockDeletedSparepart);

      await sparepartController.deleteSparepart(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Sparepart deleted successfully",
      });
      // Not returning the actual deleted sparepart data
      expect(jsonMock).not.toHaveBeenCalledWith(mockDeletedSparepart);
    });
  });
});
