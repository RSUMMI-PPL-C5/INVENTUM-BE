import { Request, Response } from "express";
import MedicalEquipmentController from "../../../../src/controllers/medicalequipment.controller";
import MedicalEquipmentService from "../../../../src/services/medicalequipment.service";

// Mock the MedicalEquipmentService
jest.mock("../services/medicalequipment.service");

describe("MedicalEquipmentController - updateMedicalEquipment", () => {
  let controller: MedicalEquipmentController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockService: jest.Mocked<MedicalEquipmentService>;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create mock service
    mockService =
      new MedicalEquipmentService() as jest.Mocked<MedicalEquipmentService>;

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
        modelName: "Updated Model",
        modifiedBy: 2,
      },
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
    mockService.updateMedicalEquipment = jest
      .fn()
      .mockResolvedValue(updatedEquipment);

    // Call the controller method
    await controller.updateMedicalEquipment(
      mockRequest as Request,
      mockResponse as Response,
    );

    // Assertions
    expect(mockService.updateMedicalEquipment).toHaveBeenCalledWith(
      "test-id-123",
      mockRequest.body,
    );
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: "success",
      data: updatedEquipment,
    });
  });

  it("should return status 404 when medical equipment is not found", async () => {
    // Setup mock implementation to return null (not found)
    mockService.updateMedicalEquipment = jest.fn().mockResolvedValue(null);

    // Call the controller method
    await controller.updateMedicalEquipment(
      mockRequest as Request,
      mockResponse as Response,
    );

    // Assertions
    expect(mockService.updateMedicalEquipment).toHaveBeenCalledWith(
      "test-id-123",
      mockRequest.body,
    );
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: "error",
      message: "Medical equipment not found or update failed",
    });
  });

  it("should return status 400 when service throws an error", async () => {
    // Error message
    const errorMessage = "Invalid data provided";

    // Setup mock implementation to throw an error
    mockService.updateMedicalEquipment = jest
      .fn()
      .mockRejectedValue(new Error(errorMessage));

    // Call the controller method
    await controller.updateMedicalEquipment(
      mockRequest as Request,
      mockResponse as Response,
    );

    // Assertions
    expect(mockService.updateMedicalEquipment).toHaveBeenCalledWith(
      "test-id-123",
      mockRequest.body,
    );
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: "error",
      message: errorMessage,
    });
  });
});
