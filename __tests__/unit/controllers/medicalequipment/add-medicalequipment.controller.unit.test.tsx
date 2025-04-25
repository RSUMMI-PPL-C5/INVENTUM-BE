import { Request, Response } from "express";
import MedicalEquipmentController from "../../../../src/controllers/medicalequipment.controller";
import MedicalEquipmentService from "../../../../src/services/medicalequipment.service";
import { AddMedicalEquipmentResponseDTO } from "../../../../src/dto/medicalequipment.dto";
import AppError from "../../../../src/utils/appError";

jest.mock("../../../../src/services/medicalequipment.service");

jest.mock("express-validator", () => ({
  validationResult: jest.fn(() => ({
    isEmpty: jest.fn(() => true),
    array: jest.fn(() => []),
  })),
}));

describe("MedicalEquipmentController - addMedicalEquipment", () => {
  let medicalEquipmentController: MedicalEquipmentController;
  let mockService: jest.Mocked<MedicalEquipmentService>;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    mockService =
      new MedicalEquipmentService() as jest.Mocked<MedicalEquipmentService>;
    medicalEquipmentController = new MedicalEquipmentController();
    (medicalEquipmentController as any).medicalEquipmentService = mockService;

    // Setup request with mock user
    req = {
      body: {},
      user: { userId: "user-123" },
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

  it("should successfully add medical equipment", async () => {
    // Arrange
    req.body = {
      inventorisId: "INV-001",
      name: "X-Ray Machine",
      brandName: "MedCorp",
      modelName: "XR-2000",
    };

    const expectedResponseData: AddMedicalEquipmentResponseDTO = {
      id: "mocked-id",
      inventorisId: "INV-001",
      name: "X-Ray Machine",
      brandName: "MedCorp",
      modelName: "XR-2000",
    };

    mockService.addMedicalEquipment.mockResolvedValue(expectedResponseData);

    // Act
    await medicalEquipmentController.addMedicalEquipment(
      req as Request,
      res as Response,
    );

    // Assert
    expect(mockService.addMedicalEquipment).toHaveBeenCalledWith({
      ...req.body,
      createdBy: "user-123",
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: expectedResponseData,
    });
  });

  it("should handle AppError correctly", async () => {
    // Arrange
    req.body = {
      inventorisId: "INV-001",
      name: "MRI Scanner",
    };

    const appError = new AppError("Inventoris ID already in use", 409);
    mockService.addMedicalEquipment.mockRejectedValue(appError);

    // Act
    await medicalEquipmentController.addMedicalEquipment(
      req as Request,
      res as Response,
    );

    // Assert
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Inventoris ID already in use",
    });
  });

  it("should handle general Error correctly", async () => {
    // Arrange
    req.body = {
      inventorisId: "INV-ERR",
      name: "ECG Machine",
    };

    mockService.addMedicalEquipment.mockRejectedValue(
      new Error("Database error"),
    );

    // Act
    await medicalEquipmentController.addMedicalEquipment(
      req as Request,
      res as Response,
    );

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Database error",
    });
  });

  it("should handle non-Error type exceptions", async () => {
    // Arrange
    req.body = {
      inventorisId: "INV-UNKNOWN",
      name: "Unknown Error Machine",
    };

    mockService.addMedicalEquipment.mockRejectedValue("Not an Error object");

    // Act
    await medicalEquipmentController.addMedicalEquipment(
      req as Request,
      res as Response,
    );

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "An unknown error occurred",
    });
  });

  it("should handle data type conversion correctly", async () => {
    // Arrange
    const purchaseDate = "2023-10-15";
    req.body = {
      inventorisId: "INV-DATE",
      name: "Calendar Equipment",
      purchasePrice: "1000.50",
      purchaseDate: purchaseDate,
    };

    const expectedResponse = {
      id: "mocked-id",
      inventorisId: "INV-DATE",
      name: "Calendar Equipment",
    };

    mockService.addMedicalEquipment.mockResolvedValue(expectedResponse);

    // Act
    await medicalEquipmentController.addMedicalEquipment(
      req as Request,
      res as Response,
    );

    // Assert
    // The controller shouldn't be doing conversions in this implementation,
    // but we're validating the service was called with the raw body data plus user ID
    expect(mockService.addMedicalEquipment).toHaveBeenCalledWith({
      ...req.body,
      createdBy: "user-123",
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: expectedResponse,
    });
  });
});
