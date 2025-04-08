import { Request, Response } from "express";
import SparepartController from "../../../../src/controllers/sparepart.controller";
import SparepartService from "../../../../src/services/sparepart.service";
import { SparepartsDTO } from "../../../../src/dto/sparepart.dto";
import { validationResult } from "express-validator";

// Mock express-validator
jest.mock("express-validator", () => ({
  validationResult: jest.fn(),
}));

// Mock SparepartService
jest.mock("../../../../src/services/sparepart.service");

describe("SparepartController - ADD", () => {
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

    mockRequest = {};
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    // Setup validation result mock
    (validationResult as unknown as jest.Mock).mockReturnValue({
      isEmpty: jest.fn().mockReturnValue(true),
      array: jest.fn().mockReturnValue([]),
    });
  });

  describe("addSparepart", () => {
    it("should add a sparepart successfully", async () => {
      const mockSparepartData: SparepartsDTO = {
        partsName: "Test Part",
        purchaseDate: new Date("2023-01-01"),
        price: 100,
        toolLocation: "Warehouse A",
        toolDate: "2023-01-05",
        createdBy: 1,
      } as SparepartsDTO;

      const mockCreatedSparepart: SparepartsDTO = {
        ...mockSparepartData,
        id: "mock-uuid",
        createdOn: new Date(),
        modifiedOn: new Date(),
      };

      mockRequest.body = mockSparepartData;
      mockSparepartService.addSparepart = jest
        .fn()
        .mockResolvedValue(mockCreatedSparepart);

      await sparepartController.addSparepart(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(validationResult).toHaveBeenCalledWith(mockRequest);
      expect(mockSparepartService.addSparepart).toHaveBeenCalledWith(
        mockSparepartData,
      );
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(mockCreatedSparepart);
    });

    it("should return 400 if validation fails", async () => {
      const validationErrors = [{ msg: "partsName is required" }];

      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(validationErrors),
      });

      await sparepartController.addSparepart(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(validationResult).toHaveBeenCalledWith(mockRequest);
      expect(mockSparepartService.addSparepart).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ errors: validationErrors });
    });

    it("should return 500 if service throws an error", async () => {
      const errorMessage = "Service error";
      mockRequest.body = { partsName: "Test Part", createdBy: 1 };

      mockSparepartService.addSparepart = jest
        .fn()
        .mockRejectedValue(new Error(errorMessage));

      await sparepartController.addSparepart(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(validationResult).toHaveBeenCalledWith(mockRequest);
      expect(mockSparepartService.addSparepart).toHaveBeenCalledWith(
        mockRequest.body,
      );
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: errorMessage });
    });

    it("should pass all request body data to service", async () => {
      const mockSparepartData: SparepartsDTO = {
        partsName: "Test Part",
        purchaseDate: new Date("2023-01-01"),
        price: 100,
        toolLocation: "Warehouse A",
        toolDate: "2023-01-05",
        createdBy: 1,
      } as SparepartsDTO;

      mockRequest.body = mockSparepartData;
      mockSparepartService.addSparepart = jest.fn().mockResolvedValue({
        ...mockSparepartData,
        id: "mock-uuid",
        createdOn: new Date(),
        modifiedOn: new Date(),
      });

      await sparepartController.addSparepart(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockSparepartService.addSparepart).toHaveBeenCalledWith(
        mockSparepartData,
      );
    });
  });
});
