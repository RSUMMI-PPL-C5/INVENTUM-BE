import { Request, Response } from "express";
import SparepartController from "../../../../src/controllers/sparepart.controller";
import SparepartService from "../../../../src/services/sparepart.service";
import { SparepartsDTO } from "../../../../src/dto/sparepart.dto";
import { validationResult } from "express-validator";
import AppError from "../../../../src/utils/appError";

// Mock express-validator
jest.mock("express-validator", () => ({
  validationResult: jest.fn(),
}));

// Mock SparepartService
jest.mock("../../../../src/services/sparepart.service");

describe("SparepartController - updateSparepart", () => {
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
      body: {},
      user: { userId: "user123" },
    };
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

  it("should update a sparepart successfully", async () => {
    const mockUpdateData: Partial<SparepartsDTO> = {
      partsName: "Updated Part",
      price: 150,
    };

    const mockUpdatedSparepart: SparepartsDTO = {
      id: "1",
      partsName: "Updated Part",
      purchaseDate: new Date("2023-01-01"),
      price: 150,
      toolLocation: "Warehouse A",
      toolDate: "2023-01-05",
      createdBy: "user123",
      createdOn: new Date("2023-01-01"),
      modifiedBy: "user123",
      modifiedOn: new Date(),
      deletedBy: null,
      deletedOn: null,
    };

    mockRequest.body = mockUpdateData;
    mockSparepartService.updateSparepart.mockResolvedValue(mockUpdatedSparepart);

    await sparepartController.updateSparepart(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(validationResult).toHaveBeenCalledWith(mockRequest);
    expect(mockSparepartService.updateSparepart).toHaveBeenCalledWith("1", {
      ...mockUpdateData,
      modifiedBy: "user123",
    });
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      status: "success",
      data: mockUpdatedSparepart,
    });
  });

  it("should return 404 if sparepart not found", async () => {
    mockRequest.body = { partsName: "Updated Part", price: 150 };
    mockSparepartService.updateSparepart.mockResolvedValue(null);

    await sparepartController.updateSparepart(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(validationResult).toHaveBeenCalledWith(mockRequest);
    expect(mockSparepartService.updateSparepart).toHaveBeenCalledWith("1", {
      ...mockRequest.body,
      modifiedBy: "user123",
    });
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      status: "error",
      message: "Sparepart not found",
    });
  });

  it("should return 400 if validation fails", async () => {
    const validationErrors = [{ msg: "partsName is required" }];

    (validationResult as unknown as jest.Mock).mockReturnValue({
      isEmpty: jest.fn().mockReturnValue(false),
      array: jest.fn().mockReturnValue(validationErrors),
    });

    await sparepartController.updateSparepart(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(validationResult).toHaveBeenCalledWith(mockRequest);
    expect(mockSparepartService.updateSparepart).not.toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      status: "error",
      errors: validationErrors,
    });
  });

  it("should return 500 if service throws an error", async () => {
    const errorMessage = "Service error";
    mockRequest.body = { partsName: "Updated Part", price: 150 };

    mockSparepartService.updateSparepart.mockRejectedValue(new Error(errorMessage));

    await sparepartController.updateSparepart(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(validationResult).toHaveBeenCalledWith(mockRequest);
    expect(mockSparepartService.updateSparepart).toHaveBeenCalledWith("1", {
      ...mockRequest.body,
      modifiedBy: "user123",
    });
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      status: "error",
      message: errorMessage,
    });
  });

  it("should return 500 with 'An unknown error occurred' if an unknown error is thrown", async () => {
    mockRequest.body = { partsName: "Updated Part", price: 150 };
  
    mockSparepartService.updateSparepart.mockRejectedValue("Unknown error");
  
    await sparepartController.updateSparepart(
      mockRequest as Request,
      mockResponse as Response
    );
  
    expect(mockSparepartService.updateSparepart).toHaveBeenCalledWith("1", {
      partsName: "Updated Part",
      price: 150,
      modifiedBy: "user123",
    });
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      status: "error",
      message: "An unknown error occurred",
    });
  });

  it("should handle AppError correctly", async () => {
    const appError = new AppError("Custom error message", 400);
    mockRequest.body = { partsName: "Updated Part", price: 150 };
  
    mockSparepartService.updateSparepart.mockRejectedValue(appError);
  
    await sparepartController.updateSparepart(
      mockRequest as Request,
      mockResponse as Response
    );
  
    expect(validationResult).toHaveBeenCalledWith(mockRequest);
    expect(mockSparepartService.updateSparepart).toHaveBeenCalledWith("1", {
      partsName: "Updated Part",
      price: 150,
      modifiedBy: "user123",
    });
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      status: "error",
      message: "Custom error message",
    });
  });
});