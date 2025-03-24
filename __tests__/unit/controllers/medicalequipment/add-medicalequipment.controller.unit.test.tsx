import { Request, Response } from "express";
import MedicalEquipmentController from "../../../../src/controllers/medicalequipment.controller";
import MedicalEquipmentService from "../../../../src/services/medicalequipment.service";
import { AddMedicalEquipmentResponseDTO } from "../../../../src/dto/medicalequipment.dto";
import { validationResult, ValidationError } from "express-validator";
import { v4 as uuidv4 } from "uuid";

jest.mock("../../../../src/services/add-medicalequipment.service");

jest.mock("express-validator", () => ({
  validationResult: jest.fn(() => ({
    isEmpty: jest.fn(() => true),
    array: jest.fn(() => []),
  })),
}));

describe("MedicalEquipmentController", () => {
  let medicalEquipmentController: MedicalEquipmentController;
  let mockService: jest.Mocked<MedicalEquipmentService>;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    mockService =
      new MedicalEquipmentService() as jest.Mocked<MedicalEquipmentService>;
    medicalEquipmentController = new MedicalEquipmentController();
    (medicalEquipmentController as any).medicalEquipmentService = mockService;

    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Positive Test
  it("should successfully add medical equipment", async () => {
    req.body = {
      inventorisId: "INV-001",
      name: "X-Ray Machine",
      brandName: "MedCorp",
      modelName: "XR-2000",
      createdBy: 1,
    };

    const expectedResponse: AddMedicalEquipmentResponseDTO = {
      id: uuidv4(),
      inventorisId: "INV-001",
      name: "X-Ray Machine",
      brandName: "MedCorp",
      modelName: "XR-2000",
    };

    mockService.addMedicalEquipment.mockResolvedValue(expectedResponse);

    await medicalEquipmentController.addMedicalEquipment(
      req as Request,
      res as Response,
    );

    expect(mockService.addMedicalEquipment).toHaveBeenCalledWith(
      expect.objectContaining(req.body),
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expectedResponse);
  });

  // Negative Test
  it("should return 409 if inventorisId already exists", async () => {
    req.body = {
      inventorisId: "INV-001",
      name: "MRI Scanner",
      createdBy: 1,
    };

    mockService.addMedicalEquipment.mockRejectedValue(
      new Error("Inventoris ID already in use"),
    );

    await medicalEquipmentController.addMedicalEquipment(
      req as Request,
      res as Response,
    );

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: "Inventoris ID already in use",
    });
  });

  it("should return 500 if an unexpected error occurs", async () => {
    req.body = {
      inventorisId: "INV-ERR",
      name: "ECG Machine",
      createdBy: 1,
    };

    mockService.addMedicalEquipment.mockRejectedValue(
      new Error("Database error"),
    );

    await medicalEquipmentController.addMedicalEquipment(
      req as Request,
      res as Response,
    );

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
  });

  it("should return 400 if validation fails", async () => {
    // Create validation errors mock result
    const validationErrorsResult = {
      isEmpty: jest.fn().mockReturnValue(false),
      array: jest
        .fn()
        .mockReturnValue([
          { param: "inventorisId", msg: "Inventoris ID is required" },
        ]),
    };

    // Update the jest.mock implementation for this test only
    (validationResult as unknown as jest.Mock).mockReturnValueOnce(
      validationErrorsResult,
    );

    req.body = {
      // Missing required fields
      name: "Defective Equipment",
    };

    await medicalEquipmentController.addMedicalEquipment(
      req as Request,
      res as Response,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      errors: expect.arrayContaining([
        expect.objectContaining({
          param: "inventorisId",
          msg: "Inventoris ID is required",
        }),
      ]),
    });
  });

  it("should properly convert purchase date to Date object", async () => {
    const testDate = "2023-10-15"; // ISO date string
    req.body = {
      inventorisId: "INV-DATE",
      name: "Calendar Equipment",
      purchaseDate: testDate,
      createdBy: 1,
    };

    const expectedResponse = {
      id: uuidv4(),
      inventorisId: "INV-DATE",
      name: "Calendar Equipment",
    };

    mockService.addMedicalEquipment.mockResolvedValue(expectedResponse);

    await medicalEquipmentController.addMedicalEquipment(
      req as Request,
      res as Response,
    );

    // Verify the service was called with date converted to Date object
    expect(mockService.addMedicalEquipment).toHaveBeenCalledWith(
      expect.objectContaining({
        inventorisId: "INV-DATE",
        purchaseDate: expect.any(Date), // Verify conversion happened
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("should return 500 with generic message for non-Error type exceptions", async () => {
    req.body = {
      inventorisId: "INV-UNKNOWN",
      name: "Unknown Error Machine",
      createdBy: 1,
    };

    // Mock service to throw a non-Error object
    mockService.addMedicalEquipment.mockRejectedValue("Not an Error object");

    await medicalEquipmentController.addMedicalEquipment(
      req as Request,
      res as Response,
    );

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "An unknown error occurred",
    });
  });

  it("should properly convert purchase price to Number", async () => {
    req.body = {
      inventorisId: "INV-PRICE",
      name: "Expensive Machine",
      purchasePrice: "1000.50", // String price
      createdBy: 1,
    };

    const expectedResponse = {
      id: uuidv4(),
      inventorisId: "INV-PRICE",
      name: "Expensive Machine",
    };

    mockService.addMedicalEquipment.mockResolvedValue(expectedResponse);

    await medicalEquipmentController.addMedicalEquipment(
      req as Request,
      res as Response,
    );

    // Verify the service was called with price converted to Number
    expect(mockService.addMedicalEquipment).toHaveBeenCalledWith(
      expect.objectContaining({
        inventorisId: "INV-PRICE",
        purchasePrice: 1000.5, // Verify conversion happened and is a number, not a string
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
