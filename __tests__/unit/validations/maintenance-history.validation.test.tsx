import { Request } from "express";
import { ValidationChain, validationResult } from "express-validator";
import {
  createMaintenanceHistoryValidation,
  maintenanceHistoryFilterQueryValidation,
} from "../../../src/validations/maintenance-history.validation";
import * as dateUtils from "../../../src/utils/date.utils";

// Helper functions
const getErrorField = (error: any): string => error.path;
const getErrorMessage = (error: any): string => error.msg;

// Helper function to run validations against a mock request
const runValidation = async (
  validations: ValidationChain[],
  mockRequest: Partial<Request>,
) => {
  // Run all validations on the request
  const promises = validations.map((validation) =>
    validation.run(mockRequest as Request),
  );
  await Promise.all(promises);

  // Return the validation result
  return validationResult(mockRequest as Request);
};

// Mock the toJakartaDate function
jest.mock("../../../src/utils/date.utils", () => ({
  toJakartaDate: jest.fn((date, isEndOfDay = false) => {
    if (!date) return date;

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return new Date(NaN); // Invalid date
    }

    if (isEndOfDay) {
      parsedDate.setHours(23, 59, 59, 999);
    } else {
      parsedDate.setHours(0, 0, 0, 0);
    }

    return parsedDate;
  }),
}));

describe("Maintenance History Validations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Create Maintenance History Validation", () => {
    test("should export an array with 5 validation rules", () => {
      expect(Array.isArray(createMaintenanceHistoryValidation)).toBe(true);
      expect(createMaintenanceHistoryValidation).toHaveLength(5);
    });

    test("should pass validation with valid data", async () => {
      const mockRequest = {
        params: {
          equipmentId: "equip-123",
        },
        body: {
          actionPerformed: "Cleaned and calibrated",
          technician: "John Doe",
          result: "Success",
          maintenanceDate: "2023-01-15T00:00:00Z",
        },
      };

      const result = await runValidation(
        createMaintenanceHistoryValidation,
        mockRequest,
      );

      expect(result.isEmpty()).toBe(true);
      expect(dateUtils.toJakartaDate).toHaveBeenCalledWith(
        "2023-01-15T00:00:00Z",
      );
    });

    test("should fail when equipmentId param is missing", async () => {
      const mockRequest = {
        params: {},
        body: {
          actionPerformed: "Cleaned and calibrated",
          technician: "John Doe",
          result: "Success",
          maintenanceDate: "2023-01-15T00:00:00Z",
        },
      };

      const result = await runValidation(
        createMaintenanceHistoryValidation,
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
        params: {
          equipmentId: "equip-123",
        },
        body: {},
      };

      const result = await runValidation(
        createMaintenanceHistoryValidation,
        mockRequest,
      );

      expect(result.isEmpty()).toBe(false);

      const errors = result.array();
      expect(errors.some((e) => getErrorField(e) === "actionPerformed")).toBe(
        true,
      );
      expect(errors.some((e) => getErrorField(e) === "technician")).toBe(true);
      expect(errors.some((e) => getErrorField(e) === "result")).toBe(true);
      expect(errors.some((e) => getErrorField(e) === "maintenanceDate")).toBe(
        true,
      );
    });

    test("should fail when result value is invalid", async () => {
      const mockRequest = {
        params: {
          equipmentId: "equip-123",
        },
        body: {
          actionPerformed: "Cleaned and calibrated",
          technician: "John Doe",
          result: "Invalid",
          maintenanceDate: "2023-01-15T00:00:00Z",
        },
      };

      const result = await runValidation(
        createMaintenanceHistoryValidation,
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
          params: {
            equipmentId: "equip-123",
          },
          body: {
            actionPerformed: "Cleaned and calibrated",
            technician: "John Doe",
            result: resultValue,
            maintenanceDate: "2023-01-15T00:00:00Z",
          },
        };

        const result = await runValidation(
          createMaintenanceHistoryValidation,
          mockRequest,
        );

        expect(result.isEmpty()).toBe(true);
      }
    });

    test("should fail when maintenanceDate has invalid format", async () => {
      const mockRequest = {
        params: {
          equipmentId: "equip-123",
        },
        body: {
          actionPerformed: "Cleaned and calibrated",
          technician: "John Doe",
          result: "Success",
          maintenanceDate: "not-a-date",
        },
      };

      const result = await runValidation(
        createMaintenanceHistoryValidation,
        mockRequest,
      );

      expect(result.isEmpty()).toBe(false);

      const errors = result.array();
      const dateError = errors.find(
        (e) => getErrorField(e) === "maintenanceDate",
      );
      expect(dateError).toBeDefined();
      expect(getErrorMessage(dateError)).toBe("Invalid date format");
    });
  });

  describe("Maintenance History Filter Query Validation", () => {
    test("should export an array with 7 validation rules", () => {
      expect(Array.isArray(maintenanceHistoryFilterQueryValidation)).toBe(true);
      expect(maintenanceHistoryFilterQueryValidation).toHaveLength(7);
    });

    test("should pass validation with no query parameters", async () => {
      const mockRequest = { query: {} };

      const result = await runValidation(
        maintenanceHistoryFilterQueryValidation,
        mockRequest,
      );

      expect(result.isEmpty()).toBe(true);
    });

    test("should pass validation with valid search parameter", async () => {
      const mockRequest = {
        query: {
          search: "john",
        },
      };

      const result = await runValidation(
        maintenanceHistoryFilterQueryValidation,
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
          maintenanceDateStart: "2023-01-01T00:00:00Z",
          maintenanceDateEnd: "2023-01-31T00:00:00Z",
          createdOnStart: "2023-01-01T00:00:00Z",
          createdOnEnd: "2023-01-31T00:00:00Z",
        },
      };

      const result = await runValidation(
        maintenanceHistoryFilterQueryValidation,
        mockRequest,
      );

      expect(result.isEmpty()).toBe(true);
      expect(dateUtils.toJakartaDate).toHaveBeenCalledWith(
        "2023-01-01T00:00:00Z",
        false,
      );
      expect(dateUtils.toJakartaDate).toHaveBeenCalledWith(
        "2023-01-31T00:00:00Z",
        true,
      );
      expect(dateUtils.toJakartaDate).toHaveBeenCalledWith(
        "2023-01-01T00:00:00Z",
        false,
      );
      expect(dateUtils.toJakartaDate).toHaveBeenCalledWith(
        "2023-01-31T00:00:00Z",
        true,
      );
      expect(dateUtils.toJakartaDate).toHaveBeenCalledTimes(4);
    });

    test("should fail when result value is invalid", async () => {
      const mockRequest = {
        query: {
          result: "Invalid",
        },
      };

      const result = await runValidation(
        maintenanceHistoryFilterQueryValidation,
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
        const mockRequest = {
          query: {
            result: resultValue,
          },
        };

        const result = await runValidation(
          maintenanceHistoryFilterQueryValidation,
          mockRequest,
        );

        expect(result.isEmpty()).toBe(true);
      }
    });

    test("should fail when maintenanceDateStart has invalid format", async () => {
      const mockRequest = {
        query: {
          maintenanceDateStart: "not-a-date",
        },
      };

      const result = await runValidation(
        maintenanceHistoryFilterQueryValidation,
        mockRequest,
      );

      expect(result.isEmpty()).toBe(false);

      const errors = result.array();
      const dateError = errors.find(
        (e) => getErrorField(e) === "maintenanceDateStart",
      );
      expect(dateError).toBeDefined();
      expect(getErrorMessage(dateError)).toBe("Invalid date format");
    });

    test("should fail when maintenanceDateEnd has invalid format", async () => {
      const mockRequest = {
        query: {
          maintenanceDateEnd: "not-a-date",
        },
      };

      const result = await runValidation(
        maintenanceHistoryFilterQueryValidation,
        mockRequest,
      );

      expect(result.isEmpty()).toBe(false);

      const errors = result.array();
      const dateError = errors.find(
        (e) => getErrorField(e) === "maintenanceDateEnd",
      );
      expect(dateError).toBeDefined();
      expect(getErrorMessage(dateError)).toBe("Invalid date format");
    });

    test("should fail when createdOnStart has invalid format", async () => {
      const mockRequest = {
        query: {
          createdOnStart: "not-a-date",
        },
      };

      const result = await runValidation(
        maintenanceHistoryFilterQueryValidation,
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
      const mockRequest = {
        query: {
          createdOnEnd: "not-a-date",
        },
      };

      const result = await runValidation(
        maintenanceHistoryFilterQueryValidation,
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
          maintenanceDateStart: "2023-06-01T00:00:00Z",
          maintenanceDateEnd: "2023-06-30T00:00:00Z",
        },
      };

      await runValidation(maintenanceHistoryFilterQueryValidation, mockRequest);

      expect(dateUtils.toJakartaDate).toHaveBeenCalledTimes(2);
      expect(dateUtils.toJakartaDate).toHaveBeenNthCalledWith(
        1,
        "2023-06-01T00:00:00Z",
        false,
      );
      expect(dateUtils.toJakartaDate).toHaveBeenNthCalledWith(
        2,
        "2023-06-30T00:00:00Z",
        true,
      );
    });

    test("should sanitize createdOn date values when valid", async () => {
      const mockRequest = {
        query: {
          createdOnStart: "2023-06-01T00:00:00Z",
          createdOnEnd: "2023-06-30T00:00:00Z",
        },
      };

      await runValidation(maintenanceHistoryFilterQueryValidation, mockRequest);

      expect(dateUtils.toJakartaDate).toHaveBeenCalledTimes(2);
      expect(dateUtils.toJakartaDate).toHaveBeenNthCalledWith(
        1,
        "2023-06-01T00:00:00Z",
        false,
      );
      expect(dateUtils.toJakartaDate).toHaveBeenNthCalledWith(
        2,
        "2023-06-30T00:00:00Z",
        true,
      );
    });

    test("should handle empty string values", async () => {
      const mockRequest = {
        query: {
          search: "",
          medicalEquipmentId: "",
          result: "",
          maintenanceDateStart: "",
          maintenanceDateEnd: "",
          createdOnStart: "",
          createdOnEnd: "",
        },
      };

      const result = await runValidation(
        maintenanceHistoryFilterQueryValidation,
        mockRequest,
      );

      // Empty strings are optional, but empty result would fail the enum check
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
          maintenanceDateStart: undefined,
          maintenanceDateEnd: undefined,
          createdOnStart: undefined,
          createdOnEnd: undefined,
        },
      };

      const result = await runValidation(
        maintenanceHistoryFilterQueryValidation,
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
          maintenanceDateStart: "not-a-date",
          createdOnStart: "2023-01-01T00:00:00Z",
        },
      };

      const result = await runValidation(
        maintenanceHistoryFilterQueryValidation,
        mockRequest,
      );

      expect(result.isEmpty()).toBe(false);

      const errors = result.array();
      expect(errors.length).toBe(1);
      expect(getErrorField(errors[0])).toBe("maintenanceDateStart");
      expect(getErrorMessage(errors[0])).toBe("Invalid date format");
      expect(dateUtils.toJakartaDate).toHaveBeenCalledWith(
        "2023-01-01T00:00:00Z",
        false,
      );
    });
  });
});
