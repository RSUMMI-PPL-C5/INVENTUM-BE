import { Request, Response } from "express";
import SparepartController from "../../../../src/controllers/sparepart.controller";
import SparepartService from "../../../../src/services/sparepart.service";
import { SparepartDTO } from "../../../../src/dto/sparepart.dto";
import AppError from "../../../../src/utils/appError";

// No need to mock express-validator anymore
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
    mockSparepartService =
      new SparepartService() as jest.Mocked<SparepartService>;
    sparepartController = new SparepartController();
    (sparepartController as any).sparepartService = mockSparepartService;

    // Setup mock request and response
    jsonMock = jest.fn().mockReturnThis();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {
      body: {},
      user: { userId: "user123" },
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
  });

  it("should add a sparepart successfully", async () => {
    const mockSparepartData = {
      partsName: "Test Part",
      purchaseDate: new Date("2023-01-01"),
      price: 100,
      toolLocation: "Warehouse A",
      toolDate: "2023-01-05",
    };

    const mockCreatedSparepart: SparepartDTO = {
      id: "mock-uuid",
      ...mockSparepartData,
      createdBy: "user123",
      createdOn: new Date(),
      modifiedBy: null,
      modifiedOn: new Date(),
      deletedBy: null,
      deletedOn: null,
    };

    mockRequest.body = mockSparepartData;
    mockSparepartService.addSparepart.mockResolvedValue(mockCreatedSparepart);

    await sparepartController.addSparepart(
      mockRequest as Request,
      mockResponse as Response,
    );

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

  it("should return 500 if service throws an error", async () => {
    const errorMessage = "Service error";
    mockRequest.body = { partsName: "Test Part" };

    mockSparepartService.addSparepart.mockRejectedValue(
      new Error(errorMessage),
    );

    await sparepartController.addSparepart(
      mockRequest as Request,
      mockResponse as Response,
    );

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

    mockSparepartService.addSparepart.mockRejectedValue("Unknown error");

    await sparepartController.addSparepart(
      mockRequest as Request,
      mockResponse as Response,
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

    mockSparepartService.addSparepart.mockRejectedValue(appError);

    await sparepartController.addSparepart(
      mockRequest as Request,
      mockResponse as Response,
    );

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

  it("should return error when user is missing", async () => {
    mockRequest.user = undefined;
    mockRequest.body = { partsName: "Test Part" };

    await sparepartController.addSparepart(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockSparepartService.addSparepart).not.toHaveBeenCalled();
  });
});
