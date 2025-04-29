import { Request, Response, NextFunction } from "express";
import CalibrationHistoryController from "../../../../src/controllers/calibration-history.controller";
import CalibrationHistoryService from "../../../../src/services/calibration-history.service";
import { CreateCalibrationHistoryDTO } from "../../../../src/dto/calibration-history.dto";

// Mock the service
jest.mock("../../../../src/services/calibration-history.service");

describe("CalibrationHistoryController - createCalibrationHistory", () => {
  let controller: CalibrationHistoryController;
  let mockService: jest.Mocked<CalibrationHistoryService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup service mock
    mockService =
      new CalibrationHistoryService() as jest.Mocked<CalibrationHistoryService>;
    (
      CalibrationHistoryService as jest.MockedClass<
        typeof CalibrationHistoryService
      >
    ).mockImplementation(() => mockService);

    mockService.createCalibrationHistory = jest.fn();

    // Setup request, response, next function mocks
    mockRequest = {
      params: {
        equipmentId: "equip123",
      },
      body: {
        actionPerformed: "Annual calibration",
        technician: "John Doe",
        result: "Success",
        calibrationDate: "2025-04-28T09:00:00Z",
        calibrationMethod: "Standard reference",
      },
      user: {
        userId: "user123",
        role: "Admin",
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();

    // Create controller instance
    controller = new CalibrationHistoryController();
  });

  // Positive case - successful creation
  it("should successfully create a calibration history record", async () => {
    // Arrange
    const mockCalibrationData: CreateCalibrationHistoryDTO = {
      medicalEquipmentId: "equip123",
      actionPerformed: "Annual calibration",
      technician: "John Doe",
      result: "Success",
      calibrationDate: new Date("2025-04-28T09:00:00Z"),
      calibrationMethod: "Standard reference",
      createdBy: "user123",
    };

    const mockCreatedRecord = {
      id: "cal123",
      ...mockCalibrationData,
      createdOn: new Date(),
    };

    mockService.createCalibrationHistory.mockResolvedValue(mockCreatedRecord);

    // Act
    await controller.createCalibrationHistory(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assert
    expect(mockService.createCalibrationHistory).toHaveBeenCalledWith(
      expect.objectContaining(mockCalibrationData),
    );
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: "success",
      data: mockCreatedRecord,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  // Positive case - with optional nextCalibrationDue
  it("should handle optional nextCalibrationDue field", async () => {
    // Arrange
    mockRequest.body.nextCalibrationDue = "2026-04-28T09:00:00Z";

    const expectedCalibrationData = {
      medicalEquipmentId: "equip123",
      actionPerformed: "Annual calibration",
      technician: "John Doe",
      result: "Success",
      calibrationDate: new Date("2025-04-28T09:00:00Z"),
      calibrationMethod: "Standard reference",
      nextCalibrationDue: new Date("2026-04-28T09:00:00Z"),
      createdBy: "user123",
    };

    const mockCreatedRecord = {
      id: "cal123",
      ...expectedCalibrationData,
      createdOn: new Date(),
    };

    mockService.createCalibrationHistory.mockResolvedValue(mockCreatedRecord);

    // Act
    await controller.createCalibrationHistory(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assert
    expect(mockService.createCalibrationHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        nextCalibrationDue: expect.any(Date),
      }),
    );
    expect(mockResponse.status).toHaveBeenCalledWith(201);
  });

  // Negative case - service throws an error
  it("should pass errors to the next middleware", async () => {
    // Arrange
    const mockError = new Error("Equipment not found");
    mockService.createCalibrationHistory.mockRejectedValue(mockError);

    // Act
    await controller.createCalibrationHistory(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assert
    expect(mockNext).toHaveBeenCalledWith(mockError);
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  // Edge case - user not authenticated
  it("should handle missing user information", async () => {
    // Arrange
    mockRequest.user = undefined;

    // Act
    await controller.createCalibrationHistory(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assert
    expect(mockNext).toHaveBeenCalled();
    expect((mockNext as jest.Mock).mock.calls[0][0]).toBeInstanceOf(Error);
    expect((mockNext as jest.Mock).mock.calls[0][0].message).toContain(
      "userId",
    );
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  // Edge case - missing equipment ID in params
  it("should handle missing equipment ID", async () => {
    // Arrange
    mockRequest.params = {};

    // Act
    await controller.createCalibrationHistory(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assert
    expect(mockService.createCalibrationHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        medicalEquipmentId: undefined,
      }),
    );
  });

  // Edge case - handling all possible result values
  it.each(["Success", "Partial", "Failed"])(
    "should handle %s result value",
    async (resultValue) => {
      // Arrange
      mockRequest.body.result = resultValue;

      const mockCreatedRecord = {
        id: "cal123",
        medicalEquipmentId: "equip123",
        result: resultValue,
        createdOn: new Date(),
        actionPerformed: "Standard calibration",
        technician: "John Doe",
        calibrationDate: new Date(),
        calibrationMethod: "Factory standard method",
        createdBy: "user-123",
      };

      mockService.createCalibrationHistory.mockResolvedValue(mockCreatedRecord);

      // Act
      await controller.createCalibrationHistory(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assert
      expect(mockService.createCalibrationHistory).toHaveBeenCalledWith(
        expect.objectContaining({
          result: resultValue,
        }),
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    },
  );
});
