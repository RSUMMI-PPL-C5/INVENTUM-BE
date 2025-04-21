import { Request, Response } from "express";
import MedicalEquipmentController from "../../../../src/controllers/medicalequipment.controller";
import MedicalEquipmentService from "../../../../src/services/medicalequipment.service";
import { validationResult } from "express-validator";
import AppError from "../../../../src/utils/appError";

jest.mock("../../../../src/services/medicalequipment.service");

jest.mock("express-validator", () => ({
  validationResult: jest.fn(() => ({
    isEmpty: jest.fn(() => true),
    array: jest.fn(() => []),
  })),
}));

describe("MedicalEquipmentController - updateMedicalEquipment", () => {
  let controller: MedicalEquipmentController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockService: jest.Mocked<MedicalEquipmentService>;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create mock service
    mockService = new MedicalEquipmentService() as jest.Mocked<MedicalEquipmentService>;

    // Create controller instance with mocked service
    controller = new MedicalEquipmentController();

    // Access the private property and assign the mock
    (controller as any).medicalEquipmentService = mockService;

    // Create mock request and response
    mockRequest = {
      params: { id: "test-id-123" },
      body: {
        name: "Updated Equipment",
        brandName: "Updated Brand",
        modelName: "Updated Model"
      },
      user: { userId: "user-456" }
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("should update medical equipment and return status 200", async () => {
    // Mock data
    const updatedEquipment = {
      id: "test-id-123",
      inventorisId: "INV123",
      name: "Updated Equipment",
      brandName: "Updated Brand",
      modelName: "Updated Model",
    };

    // Setup mock implementation
    mockService.updateMedicalEquipment.mockResolvedValue(updatedEquipment);

    // Call the controller method
    await controller.updateMedicalEquipment(
      mockRequest as Request,
      mockResponse as Response,
    );

    // Assertions
    expect(mockService.updateMedicalEquipment).toHaveBeenCalledWith(
      "test-id-123",
      {
        ...mockRequest.body,
        modifiedBy: "user-456"
      },
    );
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: "success",
      data: updatedEquipment,
    });
  });

  it("should return 400 if validation fails", async () => {
    // Arrange
    const validationErrorsResult = {
      isEmpty: jest.fn().mockReturnValue(false),
      array: jest.fn().mockReturnValue([
        { param: "name", msg: "Name is required" }
      ]),
    };

    (validationResult as unknown as jest.Mock).mockReturnValueOnce(validationErrorsResult);

    // Act
    await controller.updateMedicalEquipment(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      errors: expect.arrayContaining([
        expect.objectContaining({
          param: "name",
          msg: "Name is required",
        }),
      ]),
    });
    
    // Service should not be called if validation fails
    expect(mockService.updateMedicalEquipment).not.toHaveBeenCalled();
  });

  it("should return status 404 when medical equipment is not found", async () => {
    // Setup mock implementation to return null (not found)
    mockService.updateMedicalEquipment.mockResolvedValue(null);

    // Call the controller method
    await controller.updateMedicalEquipment(
      mockRequest as Request,
      mockResponse as Response,
    );

    // Assertions
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: "error",
      message: "Medical equipment not found",
    });
  });

  it("should handle AppError correctly", async () => {
    // Arrange
    const appError = new AppError("Equipment ID is invalid", 400);
    mockService.updateMedicalEquipment.mockRejectedValue(appError);

    // Act
    await controller.updateMedicalEquipment(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: "error",
      message: "Equipment ID is invalid"
    });
  });

  it("should handle general Error with 500 status code", async () => {
    // Error message
    const errorMessage = "Database connection failed";

    // Setup mock implementation to throw an error
    mockService.updateMedicalEquipment.mockRejectedValue(new Error(errorMessage));

    // Call the controller method
    await controller.updateMedicalEquipment(
      mockRequest as Request,
      mockResponse as Response,
    );

    // Assertions
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: "error",
      message: errorMessage,
    });
  });

  it("should handle non-Error type exceptions", async () => {
    // Arrange
    mockService.updateMedicalEquipment.mockRejectedValue("Unknown failure");

    // Act
    await controller.updateMedicalEquipment(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: "error",
      message: "An unknown error occurred"
    });
  });
});