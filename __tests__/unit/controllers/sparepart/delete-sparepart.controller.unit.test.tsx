import { Request, Response } from "express";
import SparepartController from "../../../../src/controllers/sparepart.controller";
import SparepartService from "../../../../src/services/sparepart.service";
import { SparepartsDTO } from "../../../../src/dto/sparepart.dto";
import AppError from "../../../../src/utils/appError";

// Mock SparepartService
jest.mock("../../../../src/services/sparepart.service");

describe("SparepartController - deleteSparepart", () => {
  let sparepartController: SparepartController;
  let mockSparepartService: jest.Mocked<SparepartService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock service
    mockSparepartService = new SparepartService() as jest.Mocked<SparepartService>;
    sparepartController = new SparepartController();
    (sparepartController as any).sparepartService = mockSparepartService;

    // Setup mock request and response
    jsonMock = jest.fn().mockReturnThis();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {
      params: { id: "1" },
      user: { userId: "user123" },
    };
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
  });

  it("should delete a sparepart successfully", async () => {
    const mockDeletedSparepart: SparepartsDTO = {
      id: "1",
      partsName: "Test Part",
      purchaseDate: null,
      price: 100,
      toolLocation: "Warehouse A",
      toolDate: null,
      createdBy: "user123",
      createdOn: new Date(),
      modifiedBy: null,
      modifiedOn: new Date(),
      deletedBy: "user123",
      deletedOn: new Date(),
    };

    mockSparepartService.deleteSparepart.mockResolvedValue(mockDeletedSparepart);

    await sparepartController.deleteSparepart(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockSparepartService.deleteSparepart).toHaveBeenCalledWith("1", "user123");
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      status: "success",
      message: "Sparepart deleted successfully",
    });
  });

  it("should return 404 if sparepart not found", async () => {
    mockSparepartService.deleteSparepart.mockResolvedValue(null);

    await sparepartController.deleteSparepart(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockSparepartService.deleteSparepart).toHaveBeenCalledWith("1", "user123");
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      status: "error",
      message: "Sparepart not found",
    });
  });

  it("should return 500 if service throws an error", async () => {
    const errorMessage = "Service error";
    mockSparepartService.deleteSparepart.mockRejectedValue(new Error(errorMessage));

    await sparepartController.deleteSparepart(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockSparepartService.deleteSparepart).toHaveBeenCalledWith("1", "user123");
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      status: "error",
      message: errorMessage,
    });
  });

  it("should use the id from request params", async () => {
    const mockDeletedSparepart: SparepartsDTO = {
      id: "custom-id-123",
      partsName: "Test Part",
      purchaseDate: null,
      price: 100,
      toolLocation: "Warehouse A",
      toolDate: null,
      createdBy: "user123",
      createdOn: new Date(),
      modifiedBy: null,
      modifiedOn: new Date(),
      deletedBy: "user123",
      deletedOn: new Date(),
    };

    mockRequest.params = { id: "custom-id-123" };
    mockSparepartService.deleteSparepart.mockResolvedValue(mockDeletedSparepart);

    await sparepartController.deleteSparepart(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockSparepartService.deleteSparepart).toHaveBeenCalledWith("custom-id-123", "user123");
  });

  it("should return 500 with 'An unknown error occurred' if an unknown error is thrown", async () => {
    mockSparepartService.deleteSparepart.mockRejectedValue("Unknown error");
  
    await sparepartController.deleteSparepart(
      mockRequest as Request,
      mockResponse as Response
    );
  
    expect(mockSparepartService.deleteSparepart).toHaveBeenCalledWith("1", "user123");
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      status: "error",
      message: "An unknown error occurred",
    });
  });

  it("should handle AppError correctly", async () => {
    const appError = new AppError("Custom error message", 400);
    mockSparepartService.deleteSparepart.mockRejectedValue(appError);
  
    await sparepartController.deleteSparepart(
      mockRequest as Request,
      mockResponse as Response
    );
  
    expect(mockSparepartService.deleteSparepart).toHaveBeenCalledWith("1", "user123");
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      status: "error",
      message: "Custom error message",
    });
  });
});