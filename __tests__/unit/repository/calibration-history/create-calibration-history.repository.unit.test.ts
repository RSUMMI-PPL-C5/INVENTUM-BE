import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";
import CalibrationHistoryRepository from "../../../../src/repository/calibration-history.repository";
import prisma from "../../../../src/configs/db.config";
import { getJakartaTime } from "../../../../src/utils/date.utils";

// Mock dependencies
jest.mock("../../../../src/configs/db.config", () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

jest.mock("../../../../src/utils/date.utils", () => ({
  getJakartaTime: jest.fn(),
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
const mockDate = new Date("2025-04-28T00:00:00.000Z");

describe("CalibrationHistoryRepository - createCalibrationHistory", () => {
  let repository: CalibrationHistoryRepository;

  beforeEach(() => {
    mockReset(prismaMock);
    jest.clearAllMocks();
    (getJakartaTime as jest.Mock).mockReturnValue(mockDate);
    repository = new CalibrationHistoryRepository();
  });

  // Positive case - create calibration with all required fields
  it("should successfully create a calibration history record", async () => {
    // Arrange
    const calibrationData = {
      id: "cal-123",
      medicalEquipmentId: "equip-456",
      actionPerformed: "Annual calibration",
      technician: "John Doe",
      result: "Success",
      calibrationDate: new Date("2025-04-15"),
      calibrationMethod: "Standard reference",
      createdBy: "user-789",
    };

    const expectedResult = {
      id: "cal-123",
      medicalEquipmentId: "equip-456",
      actionPerformed: "Annual calibration",
      technician: "John Doe",
      result: "Success",
      calibrationDate: new Date("2025-04-15"),
      calibrationMethod: "Standard reference",
      nextCalibrationDue: null,
      createdBy: "user-789",
      createdOn: mockDate,
    };

    prismaMock.calibrationHistory.create.mockResolvedValue(expectedResult);

    // Act
    const result = await repository.createCalibrationHistory(calibrationData);

    // Assert
    expect(prismaMock.calibrationHistory.create).toHaveBeenCalledWith({
      data: {
        id: calibrationData.id,
        actionPerformed: calibrationData.actionPerformed,
        technician: calibrationData.technician,
        result: calibrationData.result,
        calibrationDate: calibrationData.calibrationDate,
        calibrationMethod: calibrationData.calibrationMethod,
        nextCalibrationDue: null,
        createdBy: calibrationData.createdBy,
        createdOn: mockDate,
        medicalEquipment: {
          connect: {
            id: calibrationData.medicalEquipmentId,
          },
        },
      },
    });
    expect(getJakartaTime).toHaveBeenCalled();
    expect(result).toEqual(expectedResult);
  });

  // Positive case - with optional nextCalibrationDue
  it("should create calibration history with nextCalibrationDue", async () => {
    // Arrange
    const nextCalibrationDate = new Date("2026-04-15");
    const calibrationData = {
      id: "cal-123",
      medicalEquipmentId: "equip-456",
      actionPerformed: "Annual calibration",
      technician: "John Doe",
      result: "Success",
      calibrationDate: new Date("2025-04-15"),
      calibrationMethod: "Standard reference",
      nextCalibrationDue: nextCalibrationDate,
      createdBy: "user-789",
    };

    const expectedResult = {
      ...calibrationData,
      createdOn: mockDate,
    };

    prismaMock.calibrationHistory.create.mockResolvedValue(expectedResult);

    // Act
    const result = await repository.createCalibrationHistory(calibrationData);

    // Assert
    expect(prismaMock.calibrationHistory.create).toHaveBeenCalledWith({
      data: {
        id: calibrationData.id,
        actionPerformed: calibrationData.actionPerformed,
        technician: calibrationData.technician,
        result: calibrationData.result,
        calibrationDate: calibrationData.calibrationDate,
        calibrationMethod: calibrationData.calibrationMethod,
        nextCalibrationDue: nextCalibrationDate,
        createdBy: calibrationData.createdBy,
        createdOn: mockDate,
        medicalEquipment: {
          connect: {
            id: calibrationData.medicalEquipmentId,
          },
        },
      },
    });
    expect(result.nextCalibrationDue).toEqual(nextCalibrationDate);
  });

  // Negative case - handle database error
  it("should throw an error when database operation fails", async () => {
    // Arrange
    const calibrationData = {
      id: "cal-123",
      medicalEquipmentId: "equip-456",
      actionPerformed: "Annual calibration",
      technician: "John Doe",
      result: "Success",
      calibrationDate: new Date("2025-04-15"),
      calibrationMethod: "Standard reference",
      createdBy: "user-789",
    };

    const dbError = new Error("Database connection error");
    prismaMock.calibrationHistory.create.mockRejectedValue(dbError);

    // Act & Assert
    await expect(
      repository.createCalibrationHistory(calibrationData),
    ).rejects.toThrow("Database connection error");
  });

  // Edge case - handle explicit null for nextCalibrationDue
  it("should handle explicit null for nextCalibrationDue", async () => {
    // Arrange
    const calibrationData = {
      id: "cal-123",
      medicalEquipmentId: "equip-456",
      actionPerformed: "Annual calibration",
      technician: "John Doe",
      result: "Failed",
      calibrationDate: new Date("2025-04-15"),
      calibrationMethod: "Standard reference",
      nextCalibrationDue: null,
      createdBy: "user-789",
    };

    const expectedResult = {
      ...calibrationData,
      createdOn: mockDate,
    };

    prismaMock.calibrationHistory.create.mockResolvedValue(expectedResult);

    // Act
    const result = await repository.createCalibrationHistory(calibrationData);

    // Assert
    expect(prismaMock.calibrationHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        nextCalibrationDue: null,
      }),
    });
    expect(result.nextCalibrationDue).toBeNull();
  });

  // Edge case - handle special characters in text fields
  it("should handle special characters in text fields", async () => {
    // Arrange
    const specialActionPerformed =
      "Calibration using α-β-γ equipment & 100% accuracy test";
    const specialTechnician = "Dr. José Martínez-Ñúñez Jr.";

    const calibrationData = {
      id: "cal-123",
      medicalEquipmentId: "equip-456",
      actionPerformed: specialActionPerformed,
      technician: specialTechnician,
      result: "Success",
      calibrationDate: new Date("2025-04-15"),
      calibrationMethod: "ISO:9001 Standard (rev. 2)",
      createdBy: "user-789",
    };

    const expectedResult = {
      ...calibrationData,
      nextCalibrationDue: null,
      createdOn: mockDate,
    };

    prismaMock.calibrationHistory.create.mockResolvedValue(expectedResult);

    // Act
    const result = await repository.createCalibrationHistory(calibrationData);

    // Assert
    expect(prismaMock.calibrationHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actionPerformed: specialActionPerformed,
        technician: specialTechnician,
      }),
    });
    expect(result.actionPerformed).toEqual(specialActionPerformed);
    expect(result.technician).toEqual(specialTechnician);
  });
});
