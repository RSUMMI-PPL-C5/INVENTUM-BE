import { Request } from "express";
import { ValidationChain, validationResult } from "express-validator";
import {
  createCalibrationHistoryValidation,
  calibrationHistoryFilterQueryValidation,
} from "../../../src/validations/calibration-history.validation";
import * as dateUtils from "../../../src/utils/date.utils";

// Helper functions
const getErrorField = (error: any): string => error.path;
const getErrorMessage = (error: any): string => error.msg;

// Helper function to run validations against a mock request
const runValidation = async (
  validations: ValidationChain[],
  mockRequest: Partial<Request>,
) => {
  const promises = validations.map((validation) =>
    validation.run(mockRequest as Request),
  );
  await Promise.all(promises);
  return validationResult(mockRequest as Request);
};

// Mock the toJakartaDate function
jest.mock("../../../src/utils/date.utils", () => ({
  toJakartaDate: jest.fn((date, isEndOfDay = false) => {
    if (!date) return date;
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return new Date(NaN);
    }
    if (isEndOfDay) {
      parsedDate.setHours(23, 59, 59, 999);
    } else {
      parsedDate.setHours(0, 0, 0, 0);
    }
    return parsedDate;
  }),
}));

describe("Calibration History Validations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createCalibrationHistoryValidation", () => {
    test("should export an array with 7 validation rules", () => {
      expect(Array.isArray(createCalibrationHistoryValidation)).toBe(true);
      expect(createCalibrationHistoryValidation).toHaveLength(7);
    });

    test("should pass validation with valid data and optional nextCalibrationDue", async () => {
      const mockRequest = {
        params: { equipmentId: "equip-123" },
        body: {
          actionPerformed: "Calibrated",
          technician: "Jane Doe",
          result: "Success",
          calibrationDate: "2024-01-01T00:00:00Z",
          calibrationMethod: "Manual",
          nextCalibrationDue: "2024-12-31T00:00:00Z",
        },
      };
      const result = await runValidation(
        createCalibrationHistoryValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(true);
      expect(dateUtils.toJakartaDate).toHaveBeenCalledWith(
        "2024-01-01T00:00:00Z",
      );
      expect(dateUtils.toJakartaDate).toHaveBeenCalledWith(
        "2024-12-31T00:00:00Z",
      );
    });

    test("should pass validation with valid data and without nextCalibrationDue", async () => {
      const mockRequest = {
        params: { equipmentId: "equip-123" },
        body: {
          actionPerformed: "Calibrated",
          technician: "Jane Doe",
          result: "Partial",
          calibrationDate: "2024-01-01T00:00:00Z",
          calibrationMethod: "Manual",
        },
      };
      const result = await runValidation(
        createCalibrationHistoryValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(true);
      expect(dateUtils.toJakartaDate).toHaveBeenCalledWith(
        "2024-01-01T00:00:00Z",
      );
    });

    test("should fail when equipmentId param is missing", async () => {
      const mockRequest = {
        params: {},
        body: {
          actionPerformed: "Calibrated",
          technician: "Jane Doe",
          result: "Success",
          calibrationDate: "2024-01-01T00:00:00Z",
          calibrationMethod: "Manual",
        },
      };
      const result = await runValidation(
        createCalibrationHistoryValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      const idError = errors.find((e) => getErrorField(e) === "equipmentId");
      expect(idError).toBeDefined();
      expect(getErrorMessage(idError)).toBe("Equipment ID is required");
    });

    test("should fail when required body fields are missing", async () => {
      const mockRequest = {
        params: { equipmentId: "equip-123" },
        body: {},
      };
      const result = await runValidation(
        createCalibrationHistoryValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some((e) => getErrorField(e) === "actionPerformed")).toBe(
        true,
      );
      expect(errors.some((e) => getErrorField(e) === "technician")).toBe(true);
      expect(errors.some((e) => getErrorField(e) === "result")).toBe(true);
      expect(errors.some((e) => getErrorField(e) === "calibrationDate")).toBe(
        true,
      );
      expect(errors.some((e) => getErrorField(e) === "calibrationMethod")).toBe(
        true,
      );
    });

    test("should fail when result value is invalid", async () => {
      const mockRequest = {
        params: { equipmentId: "equip-123" },
        body: {
          actionPerformed: "Calibrated",
          technician: "Jane Doe",
          result: "Invalid",
          calibrationDate: "2024-01-01T00:00:00Z",
          calibrationMethod: "Manual",
        },
      };
      const result = await runValidation(
        createCalibrationHistoryValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      const resultError = errors.find((e) => getErrorField(e) === "result");
      expect(resultError).toBeDefined();
      expect(getErrorMessage(resultError)).toBe(
        "Result must be Success, Partial, Failed, Success with Issues, or Failed with Issues",
      );
    });

    test("should validate all possible valid result values", async () => {
      const validResults = [
        "Success",
        "Partial",
        "Failed",
        "Success with Issues",
        "Failed with Issues",
      ];
      for (const resultValue of validResults) {
        const mockRequest = {
          params: { equipmentId: "equip-123" },
          body: {
            actionPerformed: "Calibrated",
            technician: "Jane Doe",
            result: resultValue,
            calibrationDate: "2024-01-01T00:00:00Z",
            calibrationMethod: "Manual",
          },
        };
        const result = await runValidation(
          createCalibrationHistoryValidation,
          mockRequest,
        );
        expect(result.isEmpty()).toBe(true);
      }
    });

    test("should fail when calibrationDate has invalid format", async () => {
      const mockRequest = {
        params: { equipmentId: "equip-123" },
        body: {
          actionPerformed: "Calibrated",
          technician: "Jane Doe",
          result: "Success",
          calibrationDate: "not-a-date",
          calibrationMethod: "Manual",
        },
      };
      const result = await runValidation(
        createCalibrationHistoryValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      const dateError = errors.find(
        (e) => getErrorField(e) === "calibrationDate",
      );
      expect(dateError).toBeDefined();
      expect(getErrorMessage(dateError)).toBe("Invalid date format");
    });

    test("should fail when calibrationMethod is missing", async () => {
      const mockRequest = {
        params: { equipmentId: "equip-123" },
        body: {
          actionPerformed: "Calibrated",
          technician: "Jane Doe",
          result: "Success",
          calibrationDate: "2024-01-01T00:00:00Z",
        },
      };
      const result = await runValidation(
        createCalibrationHistoryValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      const methodError = errors.find(
        (e) => getErrorField(e) === "calibrationMethod",
      );
      expect(methodError).toBeDefined();
      expect(getErrorMessage(methodError)).toBe(
        "Calibration method is required",
      );
    });

    test("should fail when nextCalibrationDue has invalid format", async () => {
      const mockRequest = {
        params: { equipmentId: "equip-123" },
        body: {
          actionPerformed: "Calibrated",
          technician: "Jane Doe",
          result: "Success",
          calibrationDate: "2024-01-01T00:00:00Z",
          calibrationMethod: "Manual",
          nextCalibrationDue: "not-a-date",
        },
      };
      const result = await runValidation(
        createCalibrationHistoryValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      const dueError = errors.find(
        (e) => getErrorField(e) === "nextCalibrationDue",
      );
      expect(dueError).toBeDefined();
      expect(getErrorMessage(dueError)).toBe(
        "Invalid date format for next calibration due date",
      );
    });

    test("should sanitize nextCalibrationDue when valid", async () => {
      const mockRequest = {
        params: { equipmentId: "equip-123" },
        body: {
          actionPerformed: "Calibrated",
          technician: "Jane Doe",
          result: "Success",
          calibrationDate: "2024-01-01T00:00:00Z",
          calibrationMethod: "Manual",
          nextCalibrationDue: "2024-12-31T00:00:00Z",
        },
      };
      await runValidation(createCalibrationHistoryValidation, mockRequest);
      expect(dateUtils.toJakartaDate).toHaveBeenCalledWith(
        "2024-12-31T00:00:00Z",
      );
    });

    test("should sanitize calibrationDate when valid", async () => {
      const mockRequest = {
        params: { equipmentId: "equip-123" },
        body: {
          actionPerformed: "Calibrated",
          technician: "Jane Doe",
          result: "Success",
          calibrationDate: "2024-01-01T00:00:00Z",
          calibrationMethod: "Manual",
        },
      };
      await runValidation(createCalibrationHistoryValidation, mockRequest);
      expect(dateUtils.toJakartaDate).toHaveBeenCalledWith(
        "2024-01-01T00:00:00Z",
      );
    });

    test("should pass when nextCalibrationDue is null", async () => {
      const mockRequest = {
        params: { equipmentId: "equip-123" },
        body: {
          actionPerformed: "Calibrated",
          technician: "Jane Doe",
          result: "Success",
          calibrationDate: "2024-01-01T00:00:00Z",
          calibrationMethod: "Manual",
          nextCalibrationDue: null,
        },
      };
      const result = await runValidation(
        createCalibrationHistoryValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(true);
      // sanitizer tidak akan memanggil toJakartaDate jika null
      expect(dateUtils.toJakartaDate).toHaveBeenCalledWith(
        "2024-01-01T00:00:00Z",
      );
    });
  });

  describe("calibrationHistoryFilterQueryValidation", () => {
    test("should export an array with 9 validation rules", () => {
      expect(Array.isArray(calibrationHistoryFilterQueryValidation)).toBe(true);
      expect(calibrationHistoryFilterQueryValidation).toHaveLength(9);
    });

    test("should pass validation with no query parameters", async () => {
      const mockRequest = { query: {} };
      const result = await runValidation(
        calibrationHistoryFilterQueryValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(true);
    });

    test("should pass validation with valid search parameter", async () => {
      const mockRequest = { query: { search: "john" } };
      const result = await runValidation(
        calibrationHistoryFilterQueryValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(true);
    });

    test("should pass validation with valid query parameters", async () => {
      const mockRequest = {
        query: {
          search: "calibration",
          medicalEquipmentId: "equip-123",
          result: "Success",
          calibrationDateStart: "2024-01-01T00:00:00Z",
          calibrationDateEnd: "2024-01-31T00:00:00Z",
          calibrationMethod: "Manual",
          nextCalibrationDueBefore: "2024-12-31T00:00:00Z",
          createdOnStart: "2024-01-01T00:00:00Z",
          createdOnEnd: "2024-01-31T00:00:00Z",
        },
      };
      const result = await runValidation(
        calibrationHistoryFilterQueryValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(true);
      expect(dateUtils.toJakartaDate).toHaveBeenCalledWith(
        "2024-01-01T00:00:00Z",
        false,
      );
      expect(dateUtils.toJakartaDate).toHaveBeenCalledWith(
        "2024-01-31T00:00:00Z",
        true,
      );
      expect(dateUtils.toJakartaDate).toHaveBeenCalledWith(
        "2024-12-31T00:00:00Z",
        true,
      );
      expect(dateUtils.toJakartaDate).toHaveBeenCalledWith(
        "2024-01-01T00:00:00Z",
        false,
      );
      expect(dateUtils.toJakartaDate).toHaveBeenCalledWith(
        "2024-01-31T00:00:00Z",
        true,
      );
    });

    test("should fail when result value is invalid", async () => {
      const mockRequest = { query: { result: "Invalid" } };
      const result = await runValidation(
        calibrationHistoryFilterQueryValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      const resultError = errors.find((e) => getErrorField(e) === "result");
      expect(resultError).toBeDefined();
      expect(getErrorMessage(resultError)).toBe("Invalid result value");
    });

    test("should validate all possible valid result values", async () => {
      const validResults = [
        "Success",
        "Partial",
        "Failed",
        "Success with Issues",
        "Failed with Issues",
      ];
      for (const resultValue of validResults) {
        const mockRequest = { query: { result: resultValue } };
        const result = await runValidation(
          calibrationHistoryFilterQueryValidation,
          mockRequest,
        );
        expect(result.isEmpty()).toBe(true);
      }
    });

    test("should fail when calibrationDateStart has invalid format", async () => {
      const mockRequest = { query: { calibrationDateStart: "not-a-date" } };
      const result = await runValidation(
        calibrationHistoryFilterQueryValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      const dateError = errors.find(
        (e) => getErrorField(e) === "calibrationDateStart",
      );
      expect(dateError).toBeDefined();
      expect(getErrorMessage(dateError)).toBe("Invalid date format");
    });

    test("should fail when calibrationDateEnd has invalid format", async () => {
      const mockRequest = { query: { calibrationDateEnd: "not-a-date" } };
      const result = await runValidation(
        calibrationHistoryFilterQueryValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      const dateError = errors.find(
        (e) => getErrorField(e) === "calibrationDateEnd",
      );
      expect(dateError).toBeDefined();
      expect(getErrorMessage(dateError)).toBe("Invalid date format");
    });

    test("should fail when nextCalibrationDueBefore has invalid format", async () => {
      const mockRequest = { query: { nextCalibrationDueBefore: "not-a-date" } };
      const result = await runValidation(
        calibrationHistoryFilterQueryValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      const dateError = errors.find(
        (e) => getErrorField(e) === "nextCalibrationDueBefore",
      );
      expect(dateError).toBeDefined();
      expect(getErrorMessage(dateError)).toBe("Invalid date format");
    });

    test("should fail when createdOnStart has invalid format", async () => {
      const mockRequest = { query: { createdOnStart: "not-a-date" } };
      const result = await runValidation(
        calibrationHistoryFilterQueryValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      const dateError = errors.find(
        (e) => getErrorField(e) === "createdOnStart",
      );
      expect(dateError).toBeDefined();
      expect(getErrorMessage(dateError)).toBe("Invalid date format");
    });

    test("should fail when createdOnEnd has invalid format", async () => {
      const mockRequest = { query: { createdOnEnd: "not-a-date" } };
      const result = await runValidation(
        calibrationHistoryFilterQueryValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      const dateError = errors.find((e) => getErrorField(e) === "createdOnEnd");
      expect(dateError).toBeDefined();
      expect(getErrorMessage(dateError)).toBe("Invalid date format");
    });

    test("should sanitize date values when valid", async () => {
      const mockRequest = {
        query: {
          calibrationDateStart: "2024-06-01T00:00:00Z",
          calibrationDateEnd: "2024-06-30T00:00:00Z",
        },
      };
      await runValidation(calibrationHistoryFilterQueryValidation, mockRequest);
      expect(dateUtils.toJakartaDate).toHaveBeenCalledWith(
        "2024-06-01T00:00:00Z",
        false,
      );
      expect(dateUtils.toJakartaDate).toHaveBeenCalledWith(
        "2024-06-30T00:00:00Z",
        true,
      );
    });

    test("should sanitize createdOn date values when valid", async () => {
      const mockRequest = {
        query: {
          createdOnStart: "2024-06-01T00:00:00Z",
          createdOnEnd: "2024-06-30T00:00:00Z",
        },
      };
      await runValidation(calibrationHistoryFilterQueryValidation, mockRequest);
      expect(dateUtils.toJakartaDate).toHaveBeenCalledWith(
        "2024-06-01T00:00:00Z",
        false,
      );
      expect(dateUtils.toJakartaDate).toHaveBeenCalledWith(
        "2024-06-30T00:00:00Z",
        true,
      );
    });

    test("should sanitize nextCalibrationDueBefore when valid", async () => {
      const mockRequest = {
        query: {
          nextCalibrationDueBefore: "2024-12-31T00:00:00Z",
        },
      };
      await runValidation(calibrationHistoryFilterQueryValidation, mockRequest);
      expect(dateUtils.toJakartaDate).toHaveBeenCalledWith(
        "2024-12-31T00:00:00Z",
        true,
      );
    });

    test("should handle empty string values", async () => {
      const mockRequest = {
        query: {
          search: "",
          medicalEquipmentId: "",
          result: "",
          calibrationDateStart: "",
          calibrationDateEnd: "",
          calibrationMethod: "",
          nextCalibrationDueBefore: "",
          createdOnStart: "",
          createdOnEnd: "",
        },
      };
      const result = await runValidation(
        calibrationHistoryFilterQueryValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      const resultError = errors.find((e) => getErrorField(e) === "result");
      expect(resultError).toBeDefined();
      expect(getErrorMessage(resultError)).toBe("Invalid result value");
    });

    test("should handle undefined values", async () => {
      const mockRequest = {
        query: {
          search: undefined,
          medicalEquipmentId: undefined,
          result: undefined,
          calibrationDateStart: undefined,
          calibrationDateEnd: undefined,
          calibrationMethod: undefined,
          nextCalibrationDueBefore: undefined,
          createdOnStart: undefined,
          createdOnEnd: undefined,
        },
      };
      const result = await runValidation(
        calibrationHistoryFilterQueryValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(true);
    });

    test("should handle mixed valid and invalid parameters", async () => {
      const mockRequest = {
        query: {
          search: "calibration",
          medicalEquipmentId: "equip-123",
          result: "Success",
          calibrationDateStart: "not-a-date",
          createdOnStart: "2024-01-01T00:00:00Z",
        },
      };
      const result = await runValidation(
        calibrationHistoryFilterQueryValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.length).toBe(1);
      expect(getErrorField(errors[0])).toBe("calibrationDateStart");
      expect(getErrorMessage(errors[0])).toBe("Invalid date format");
      expect(dateUtils.toJakartaDate).toHaveBeenCalledWith(
        "2024-01-01T00:00:00Z",
        false,
      );
    });
  });
});
