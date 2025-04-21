import { Request, Response } from "express";
import SparepartController from "../../../../src/controllers/sparepart.controller";
import SparepartService from "../../../../src/services/sparepart.service";
import { SparepartDTO } from "../../../../src/dto/sparepart.dto";
import { validationResult } from "express-validator";
import AppError from "../../../../src/utils/appError";

// Mock express-validator
jest.mock("express-validator", () => ({
  validationResult: jest.fn(),
}));

// Mock SparepartService
jest.mock("../../../../src/services/sparepart.service");

describe("SparepartController - addSparepart", () => {
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

  it("should add a sparepart successfully", async () => {
    const mockSparepartData: SparepartDTO = {
      id: "mock-id",
      partsName: "Test Part",
      purchaseDate: new Date("2023-01-01"),
      price: 100,
      toolLocation: "Warehouse A",
      toolDate: "2023-01-05",
      createdBy: "user123",
      createdOn: new Date(),
      modifiedBy: null,
      modifiedOn: new Date(),
      deletedBy: null,
      deletedOn: null,
    };

    const mockCreatedSparepart: SparepartDTO = {
      ...mockSparepartData,
      id: "mock-uuid",
      createdOn: new Date(),
      modifiedOn: new Date(),
    };

    mockRequest.body = mockSparepartData;
    mockRequest.user = { userId: "user123" };
    mockSparepartService.addSparepart.mockResolvedValue(mockCreatedSparepart);

    await sparepartController.addSparepart(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(validationResult).toHaveBeenCalledWith(mockRequest);
    expect(mockSparepartService.addSparepart).toHaveBeenCalledWith({
      ...mockSparepartData,
      createdBy: "user123",
    });
    expect(statusMock).toHaveBeenCalledWith(201);
    expect(jsonMock).toHaveBeenCalledWith({
      status: "success",
      data: mockCreatedSparepart,
    });
  });

  it("should return 400 if validation fails", async () => {
    const validationErrors = [{ msg: "partsName is required" }];

    (validationResult as unknown as jest.Mock).mockReturnValue({
      isEmpty: jest.fn().mockReturnValue(false),
      array: jest.fn().mockReturnValue(validationErrors),
    });

    await sparepartController.addSparepart(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(validationResult).toHaveBeenCalledWith(mockRequest);
    expect(mockSparepartService.addSparepart).not.toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      status: "error",
      errors: validationErrors,
    });
  });

  it("should return 500 if service throws an error", async () => {
    const errorMessage = "Service error";
    mockRequest.body = { partsName: "Test Part" };
    mockRequest.user = { userId: "user123" };

    mockSparepartService.addSparepart.mockRejectedValue(new Error(errorMessage));

    await sparepartController.addSparepart(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(validationResult).toHaveBeenCalledWith(mockRequest);
    expect(mockSparepartService.addSparepart).toHaveBeenCalledWith({
      partsName: "Test Part",
      createdBy: "user123",
    });
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      status: "error",
      message: errorMessage,
    });
  });

  it("should return 500 with 'An unknown error occurred' if an unknown error is thrown", async () => {
    mockRequest.body = { partsName: "Test Part" };
    mockRequest.user = { userId: "user123" };
  
    mockSparepartService.addSparepart.mockRejectedValue("Unknown error");
  
    await sparepartController.addSparepart(
      mockRequest as Request,
      mockResponse as Response
    );
  
    expect(mockSparepartService.addSparepart).toHaveBeenCalledWith({
      partsName: "Test Part",
      createdBy: "user123",
    });
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      status: "error",
      message: "An unknown error occurred",
    });
  });

  it("should handle AppError correctly", async () => {
    const appError = new AppError("Custom error message", 400);
    mockRequest.body = { partsName: "Test Part" };
    mockRequest.user = { userId: "user123" };
  
    mockSparepartService.addSparepart.mockRejectedValue(appError);
  
    await sparepartController.addSparepart(
      mockRequest as Request,
      mockResponse as Response
    );
  
    expect(validationResult).toHaveBeenCalledWith(mockRequest);
    expect(mockSparepartService.addSparepart).toHaveBeenCalledWith({
      partsName: "Test Part",
      createdBy: "user123",
    });
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      status: "error",
      message: "Custom error message",
    });
  });
});