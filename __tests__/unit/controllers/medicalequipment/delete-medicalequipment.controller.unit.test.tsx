import { Request, Response } from "express";
import MedicalEquipmentController from "../../../../src/controllers/medicalequipment.controller";
import MedicalEquipmentService from "../../../../src/services/medicalequipment.service";
import AppError from "../../../../src/utils/appError";
import { MedicalEquipmentDTO } from "../../../../src/dto/medicalequipment.dto";

jest.mock("../../../../src/services/medicalequipment.service");

describe("MedicalEquipmentController - deleteMedicalEquipment", () => {
  let medicalEquipmentController: MedicalEquipmentController;
  let mockService: jest.Mocked<MedicalEquipmentService>;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    mockService = new MedicalEquipmentService() as jest.Mocked<MedicalEquipmentService>;
    medicalEquipmentController = new MedicalEquipmentController();
    (medicalEquipmentController as any).medicalEquipmentService = mockService;

    // Setup request with mock user and params
    req = {
      params: { id: "equip-123" },
      user: { userId: "user-456" }
    };
    
    // Setup response with mock methods
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully delete medical equipment", async () => {
    // Arrange
    const mockDeletedEquipment: MedicalEquipmentDTO = {
      id: "equip-123",
      name: "Deleted Equipment",
      inventorisId: "INV-001",
      status: "Active",
      brandName: null,
      modelName: null,
      purchaseDate: null,
      purchasePrice: null,
      vendor: null,
      createdBy: "user-123",
      createdOn: new Date(),
      modifiedBy: "user-123",
      modifiedOn: new Date(),
      deletedBy: "user-456",
      deletedOn: new Date()
    };

    mockService.deleteMedicalEquipment.mockResolvedValue(mockDeletedEquipment);

    // Act
    await medicalEquipmentController.deleteMedicalEquipment(req as Request, res as Response);

    // Assert
    expect(mockService.deleteMedicalEquipment).toHaveBeenCalledWith(
      "equip-123", 
      "user-456"
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Medical Equipment deleted successfully"
    });
  });

  it("should return 404 if equipment not found", async () => {
    // Arrange
    mockService.deleteMedicalEquipment.mockResolvedValue(null);

    // Act
    await medicalEquipmentController.deleteMedicalEquipment(req as Request, res as Response);

    // Assert
    expect(mockService.deleteMedicalEquipment).toHaveBeenCalledWith(
      "equip-123", 
      "user-456"
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Medical Equipment not found"
    });
  });

  it("should handle AppError correctly", async () => {
    // Arrange
    const appError = new AppError("Equipment ID is required", 400);
    mockService.deleteMedicalEquipment.mockRejectedValue(appError);

    // Act
    await medicalEquipmentController.deleteMedicalEquipment(req as Request, res as Response);

    // Assert
    expect(mockService.deleteMedicalEquipment).toHaveBeenCalledWith(
      "equip-123", 
      "user-456"
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Equipment ID is required"
    });
  });

  it("should handle general Error correctly", async () => {
    // Arrange
    const generalError = new Error("Database connection failed");
    mockService.deleteMedicalEquipment.mockRejectedValue(generalError);

    // Act
    await medicalEquipmentController.deleteMedicalEquipment(req as Request, res as Response);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Database connection failed"
    });
  });

  it("should handle non-Error type exceptions", async () => {
    // Arrange
    mockService.deleteMedicalEquipment.mockRejectedValue("Unknown error occurred");

    // Act
    await medicalEquipmentController.deleteMedicalEquipment(req as Request, res as Response);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "An unknown error occurred"
    });
  });

  it("should handle missing user information", async () => {
    // Arrange
    req.user = undefined;
    
    // Act
    await medicalEquipmentController.deleteMedicalEquipment(req as Request, res as Response);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: expect.stringContaining("Cannot read")
    });
  });
});