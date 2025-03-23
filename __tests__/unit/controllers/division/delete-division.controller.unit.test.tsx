import { Request, Response } from "express";
import DivisionController from "../../../../src/controllers/division.controller";
import DivisionService from "../../../../src/services/division.service";

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

  it("should handle errors and return 500", async () => {
    const errorMessage = "Internal Server Error";
    mockDivisionService.deleteDivision.mockRejectedValue(
      new Error(errorMessage),
    );

    await divisionController.deleteDivision(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockDivisionService.deleteDivision).toHaveBeenCalledWith(1);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
  });
});
