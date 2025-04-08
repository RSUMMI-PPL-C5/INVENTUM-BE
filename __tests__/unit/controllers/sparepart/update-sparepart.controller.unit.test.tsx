import { Request, Response } from "express";
import SparepartController from "../../../../src/controllers/sparepart.controller";
import SparepartService from "../../../../src/services/sparepart.service";
import { SparepartsDTO } from "../../../../src/dto/sparepart.dto";

// Mock SparepartService
jest.mock("../../../../src/services/sparepart.service");

describe("SparepartController - UPDATE", () => {
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
      body: {},
    };
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
  });

  describe("updateSparepart", () => {
    it("should update a sparepart successfully", async () => {
      const mockUpdateData: Partial<SparepartsDTO> = {
        partsName: "Updated Part",
        price: 150,
        modifiedBy: 2,
      };

      const mockUpdatedSparepart: SparepartsDTO = {
        id: "1",
        partsName: "Updated Part",
        purchaseDate: new Date("2023-01-01"),
        price: 150,
        toolLocation: "Warehouse A",
        toolDate: "2023-01-05",
        createdBy: 1,
        createdOn: new Date("2023-01-01"),
        modifiedBy: 2,
        modifiedOn: new Date(),
      } as SparepartsDTO;

      mockRequest.body = mockUpdateData;
      mockSparepartService.updateSparepart = jest
        .fn()
        .mockResolvedValue(mockUpdatedSparepart);

      await sparepartController.updateSparepart(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockSparepartService.updateSparepart).toHaveBeenCalledWith(
        "1",
        mockUpdateData,
      );
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockUpdatedSparepart);
    });

    it("should return 404 if sparepart not found or data is invalid", async () => {
      mockRequest.body = { partsName: "Updated Part", modifiedBy: 2 };
      mockSparepartService.updateSparepart = jest.fn().mockResolvedValue(null);

      await sparepartController.updateSparepart(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockSparepartService.updateSparepart).toHaveBeenCalledWith(
        "1",
        mockRequest.body,
      );
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Sparepart not found or invalid data",
      });
    });

    it("should return 500 if service throws an error", async () => {
      const errorMessage = "Service error";
      mockRequest.body = { partsName: "Updated Part", modifiedBy: 2 };

      mockSparepartService.updateSparepart = jest
        .fn()
        .mockRejectedValue(new Error(errorMessage));

      await sparepartController.updateSparepart(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockSparepartService.updateSparepart).toHaveBeenCalledWith(
        "1",
        mockRequest.body,
      );
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ message: errorMessage });
    });

    it("should pass all request body data to service", async () => {
      const mockUpdateData: Partial<SparepartsDTO> = {
        partsName: "Updated Part",
        price: 150,
        toolLocation: "New Location",
        toolDate: "2023-02-05",
        modifiedBy: 2,
      };

      mockRequest.body = mockUpdateData;
      mockSparepartService.updateSparepart = jest.fn().mockResolvedValue({
        id: "1",
        ...mockUpdateData,
        purchaseDate: new Date("2023-01-01"),
        createdBy: 1,
        createdOn: new Date("2023-01-01"),
        modifiedOn: new Date(),
      });

      await sparepartController.updateSparepart(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockSparepartService.updateSparepart).toHaveBeenCalledWith(
        "1",
        mockUpdateData,
      );
    });
  });
});
