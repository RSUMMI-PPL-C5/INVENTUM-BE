import { Request, Response } from "express";
import DivisionController from "../../../../src/controllers/division.controller";
import DivisionService from "../../../../src/services/division.service";
import AppError from "../../../../src/utils/appError";

jest.mock("../../../../src/services/division.service");

describe("DivisionController - UPDATE", () => {
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
      body: {},
    };

    mockDivisionService = new DivisionService() as jest.Mocked<DivisionService>;
    (DivisionService as jest.Mock).mockImplementation(
      () => mockDivisionService,
    );

    divisionController = new DivisionController();
  });

  // Positive test case
  it("should update a division and return 200", async () => {
    const updatedDivision = { id: 1, divisi: "Updated Division", parentId: 2 };
    mockDivisionService.updateDivision.mockResolvedValue(updatedDivision);

    mockRequest.body = { divisi: "Updated Division", parentId: 2 };

    await divisionController.updateDivision(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockDivisionService.updateDivision).toHaveBeenCalledWith(1, {
      divisi: "Updated Division",
      parentId: 2,
    });
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Division updated successfully",
      division: updatedDivision,
    });
  });

  it("should handle parentId as null and update the division", async () => {
    const updatedDivision = {
      id: 1,
      divisi: "Updated Division",
      parentId: null,
    };
    mockDivisionService.updateDivision.mockResolvedValue(updatedDivision);

    mockRequest.body = { divisi: "Updated Division", parentId: null };

    await divisionController.updateDivision(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockDivisionService.updateDivision).toHaveBeenCalledWith(1, {
      divisi: "Updated Division",
      parentId: null,
    });
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Division updated successfully",
      division: updatedDivision,
    });
  });

  // Negative test cases
  it("should return 400 if division ID is invalid", async () => {
    mockRequest.params = { id: "invalid" };

    await divisionController.updateDivision(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockDivisionService.updateDivision).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Invalid division ID",
    });
  });

  it("should return 400 if no update data is provided", async () => {
    mockRequest.body = {};

    await divisionController.updateDivision(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockDivisionService.updateDivision).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "No update data provided",
    });
  });

  it("should return 400 if parentId is invalid", async () => {
    mockRequest.body = { parentId: "invalid" };

    await divisionController.updateDivision(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockDivisionService.updateDivision).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Invalid parent ID",
    });
  });

  // Corner cases
  it("should handle AppError and return the appropriate status code and message", async () => {
    const appError = new AppError("Custom error message", 403);
    mockDivisionService.updateDivision.mockRejectedValue(appError);

    mockRequest.body = { divisi: "Updated Division" };

    await divisionController.updateDivision(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockDivisionService.updateDivision).toHaveBeenCalledWith(1, {
      divisi: "Updated Division",
      parentId: undefined,
    });
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Custom error message",
    });
  });

  it("should handle unexpected errors and return 500", async () => {
    const errorMessage = "Unexpected error";
    mockDivisionService.updateDivision.mockRejectedValue(
      new Error(errorMessage),
    );

    mockRequest.body = { divisi: "Updated Division" };

    await divisionController.updateDivision(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockDivisionService.updateDivision).toHaveBeenCalledWith(1, {
      divisi: "Updated Division",
      parentId: undefined,
    });
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "An unexpected error occurred",
    });
  });
});
