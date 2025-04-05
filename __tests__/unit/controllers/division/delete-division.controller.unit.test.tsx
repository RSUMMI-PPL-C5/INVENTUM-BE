import { Request, Response } from "express";
import DivisionController from "../../../../src/controllers/division.controller";
import DivisionService from "../../../../src/services/division.service";
import AppError from "../../../../src/utils/appError";

jest.mock("../../../../src/services/division.service");

describe("DivisionController - DELETE", () => {
  let divisionController: DivisionController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockDivisionService: jest.Mocked<DivisionService>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockRequest = {
      params: { id: "1" },
    };

    mockDivisionService = new DivisionService() as jest.Mocked<DivisionService>;
    (DivisionService as jest.Mock).mockImplementation(
      () => mockDivisionService,
    );

    divisionController = new DivisionController();
  });

  it("should delete a division and return 200", async () => {
    mockDivisionService.deleteDivision.mockResolvedValue(true);

    await divisionController.deleteDivision(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockDivisionService.deleteDivision).toHaveBeenCalledWith(1);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Division deleted successfully",
    });
  });

  it("should return 404 if division not found", async () => {
    mockDivisionService.deleteDivision.mockResolvedValue(false);

    await divisionController.deleteDivision(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockDivisionService.deleteDivision).toHaveBeenCalledWith(1);
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Division not found",
    });
  });

  it("should return 400 if division ID is invalid", async () => {
    mockRequest.params = { id: "invalid" };

    await divisionController.deleteDivision(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockDivisionService.deleteDivision).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Invalid division ID",
    });
  });

  it("should handle AppError and return the appropriate status code and message", async () => {
    const appError = new AppError("Custom error message", 403);
    mockDivisionService.deleteDivision.mockRejectedValue(appError);

    await divisionController.deleteDivision(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockDivisionService.deleteDivision).toHaveBeenCalledWith(1);
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Custom error message",
    });
  });

  it("should handle unexpected errors and return 500", async () => {
    const errorMessage = "Unexpected error";
    mockDivisionService.deleteDivision.mockRejectedValue(
      new Error(errorMessage),
    );

    await divisionController.deleteDivision(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockDivisionService.deleteDivision).toHaveBeenCalledWith(1);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "An unexpected error occurred.",
    });
  });
});
