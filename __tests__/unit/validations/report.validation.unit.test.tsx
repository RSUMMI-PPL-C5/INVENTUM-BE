import { Request } from "express";
import { ValidationChain, validationResult } from "express-validator";
import { exportDataValidation } from "../../../src/validations/report.validation";
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

describe("Report Validations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Export Data Validation", () => {
    test("should export an array with 2 validation rules", () => {
      expect(Array.isArray(exportDataValidation)).toBe(true);
      expect(exportDataValidation).toHaveLength(2);
    });

    test("should pass validation with valid dates", async () => {
      const mockRequest = {
        query: {
          startDate: "2024-01-01T00:00:00Z",
          endDate: "2024-12-31T00:00:00Z",
        },
      };

      const result = await runValidation(exportDataValidation, mockRequest);

      expect(result.isEmpty()).toBe(true);
      expect(dateUtils.toJakartaDate).toHaveBeenCalledWith(
        "2024-01-01T00:00:00Z",
        false,
      );
      expect(dateUtils.toJakartaDate).toHaveBeenCalledWith(
        "2024-12-31T00:00:00Z",
        true,
      );
    });

    test("should fail when startDate is missing", async () => {
      const mockRequest = {
        query: {
          endDate: "2024-12-31T00:00:00Z",
        },
      };

      const result = await runValidation(exportDataValidation, mockRequest);

      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      const startDateError = errors.find(
        (e) => getErrorField(e) === "startDate",
      );
      expect(startDateError).toBeDefined();
      expect(getErrorMessage(startDateError)).toBe("Start date is required");
    });

    test("should fail when endDate is missing", async () => {
      const mockRequest = {
        query: {
          startDate: "2024-01-01T00:00:00Z",
        },
      };

      const result = await runValidation(exportDataValidation, mockRequest);

      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      const endDateError = errors.find((e) => getErrorField(e) === "endDate");
      expect(endDateError).toBeDefined();
      expect(getErrorMessage(endDateError)).toBe("End date is required");
    });

    test("should fail when startDate has invalid format", async () => {
      const mockRequest = {
        query: {
          startDate: "not-a-date",
          endDate: "2024-12-31T00:00:00Z",
        },
      };

      const result = await runValidation(exportDataValidation, mockRequest);

      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      const startDateError = errors.find(
        (e) => getErrorField(e) === "startDate",
      );
      expect(startDateError).toBeDefined();
      expect(getErrorMessage(startDateError)).toBe("Invalid start date format");
    });

    test("should fail when endDate has invalid format", async () => {
      const mockRequest = {
        query: {
          startDate: "2024-01-01T00:00:00Z",
          endDate: "not-a-date",
        },
      };

      const result = await runValidation(exportDataValidation, mockRequest);

      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      const endDateError = errors.find((e) => getErrorField(e) === "endDate");
      expect(endDateError).toBeDefined();
      expect(getErrorMessage(endDateError)).toBe("Invalid end date format");
    });

    test("should sanitize date values when valid", async () => {
      const mockRequest = {
        query: {
          startDate: "2024-01-01T00:00:00Z",
          endDate: "2024-12-31T00:00:00Z",
        },
      };

      await runValidation(exportDataValidation, mockRequest);

      expect(dateUtils.toJakartaDate).toHaveBeenCalledTimes(2);
      expect(dateUtils.toJakartaDate).toHaveBeenNthCalledWith(
        1,
        "2024-01-01T00:00:00Z",
        false,
      );
      expect(dateUtils.toJakartaDate).toHaveBeenNthCalledWith(
        2,
        "2024-12-31T00:00:00Z",
        true,
      );
    });

    test("should handle empty string values", async () => {
      const mockRequest = {
        query: {
          startDate: "",
          endDate: "",
        },
      };

      const result = await runValidation(exportDataValidation, mockRequest);

      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.length).toBe(4);
      expect(errors.some((e) => getErrorField(e) === "startDate")).toBe(true);
      expect(errors.some((e) => getErrorField(e) === "endDate")).toBe(true);
    });

    test("should handle undefined values", async () => {
      const mockRequest = {
        query: {
          startDate: undefined,
          endDate: undefined,
        },
      };

      const result = await runValidation(exportDataValidation, mockRequest);

      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.length).toBe(4);
      expect(errors.some((e) => getErrorField(e) === "startDate")).toBe(true);
      expect(errors.some((e) => getErrorField(e) === "endDate")).toBe(true);
    });
  });
});
