import { Request } from "express";
import { ValidationChain, validationResult } from "express-validator";
import { medicalEquipmentFilterQueryValidation } from "../../../src/validations/medicalequipmentfilterquery.validation";
import * as dateUtils from "../../../src/utils/date.utils";

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

// Helper function to run validations against a mock request
const runValidation = async (
  validations: ValidationChain[],
  mockRequest: Partial<Request>,
) => {
  // Run all validations on the request
  for (const validation of validations) {
    await validation.run(mockRequest as Request);
  }

  // Return the validation result
  return validationResult(mockRequest as Request);
};

describe("Invalid Values Handling", () => {
  it("should convert empty string to undefined", async () => {
    const mockRequest = { query: { status: "" } };
    await runValidation(medicalEquipmentFilterQueryValidation, mockRequest);

    expect(mockRequest.query.status).toBeUndefined();
  });

  it("should reject array with one invalid status", async () => {
    const mockRequest = { query: { status: ["Active", "Invalid"] } };
    const result = await runValidation(
      medicalEquipmentFilterQueryValidation,
      mockRequest,
    );

    expect(result.isEmpty()).toBe(false);
    const errors = result.array();
    expect(errors).toContainEqual(
      expect.objectContaining({
        msg: "status must contain Active, Maintenance, or Inactive",
      }),
    );
  });

  it("should reject array with multiple invalid statuses", async () => {
    const mockRequest = { query: { status: ["Invalid1", "Invalid2"] } };
    const result = await runValidation(
      medicalEquipmentFilterQueryValidation,
      mockRequest,
    );

    expect(result.isEmpty()).toBe(false);
    const errors = result.array();
    expect(errors).toContainEqual(
      expect.objectContaining({
        msg: "status must contain Active, Maintenance, or Inactive",
      }),
    );
  });
});

describe("Optional Behavior", () => {
  it("should pass validation when status is not provided", async () => {
    const mockRequest: { query: { status?: string } } = { query: {} };
    const result = await runValidation(
      medicalEquipmentFilterQueryValidation,
      mockRequest,
    );

    expect(result.isEmpty()).toBe(true);
    expect(mockRequest.query.status).toBeUndefined();
  });

  it("should pass validation when status is explicitly undefined", async () => {
    const mockRequest = { query: { status: undefined } };
    const result = await runValidation(
      medicalEquipmentFilterQueryValidation,
      mockRequest,
    );

    expect(result.isEmpty()).toBe(true);
    expect(mockRequest.query.status).toBeUndefined();
  });
});

describe("Medical Equipment Filter Query Validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Status Filter Validation", () => {
    it("should pass validation for valid single status value", async () => {
      const mockRequest = { query: { status: "Active" } };
      const result = await runValidation(
        medicalEquipmentFilterQueryValidation,
        mockRequest,
      );

      expect(result.isEmpty()).toBe(true);
      expect(mockRequest.query.status).toEqual(["Active"]);
    });

    it("should pass validation for valid status array", async () => {
      const mockRequest = { query: { status: ["Active", "Maintenance"] } };
      const result = await runValidation(
        medicalEquipmentFilterQueryValidation,
        mockRequest,
      );

      expect(result.isEmpty()).toBe(true);
      expect(mockRequest.query.status).toEqual(["Active", "Maintenance"]);
    });

    it("should fail validation for invalid status value", async () => {
      const mockRequest = { query: { status: "Invalid" } };
      const result = await runValidation(
        medicalEquipmentFilterQueryValidation,
        mockRequest,
      );

      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors).toContainEqual(
        expect.objectContaining({
          msg: "status must contain Active, Maintenance, or Inactive",
        }),
      );
    });

    it("should fail validation for array with invalid status value", async () => {
      const mockRequest = { query: { status: ["Active", "Invalid"] } };
      const result = await runValidation(
        medicalEquipmentFilterQueryValidation,
        mockRequest,
      );

      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors).toContainEqual(
        expect.objectContaining({
          msg: "status must contain Active, Maintenance, or Inactive",
        }),
      );
    });
  });

  describe("Date Filter Validation - Start Dates", () => {
    it("should pass and sanitize valid start dates", async () => {
      const testDate = "2023-05-15T10:00:00Z";
      const dateFields = [
        "purchaseDateStart",
        "createdOnStart",
        "modifiedOnStart",
      ];

      for (const field of dateFields) {
        const mockRequest = { query: { [field]: testDate } };
        const result = await runValidation(
          medicalEquipmentFilterQueryValidation,
          mockRequest,
        );

        expect(result.isEmpty()).toBe(true);
        expect(dateUtils.toJakartaDate).toHaveBeenCalledWith(testDate);
      }
    });

    it("should fail validation for invalid start dates", async () => {
      const invalidDate = "not-a-date";
      const dateFields = [
        "purchaseDateStart",
        "createdOnStart",
        "modifiedOnStart",
      ];

      for (const field of dateFields) {
        const mockRequest = { query: { [field]: invalidDate } };
        const result = await runValidation(
          medicalEquipmentFilterQueryValidation,
          mockRequest,
        );

        expect(result.isEmpty()).toBe(false);
        const errors = result.array();
        expect(errors).toContainEqual(
          expect.objectContaining({
            msg: `${field} must be a valid ISO date`,
          }),
        );
      }
    });
  });

  describe("Date Filter Validation - End Dates", () => {
    it("should pass and sanitize valid end dates", async () => {
      const testDate = "2023-05-15T10:00:00Z";
      const dateFields = ["purchaseDateEnd", "createdOnEnd", "modifiedOnEnd"];

      for (const field of dateFields) {
        const mockRequest = { query: { [field]: testDate } };
        const result = await runValidation(
          medicalEquipmentFilterQueryValidation,
          mockRequest,
        );

        expect(result.isEmpty()).toBe(true);
        expect(dateUtils.toJakartaDate).toHaveBeenCalledWith(testDate, true);
      }
    });

    it("should fail validation for invalid end dates", async () => {
      const invalidDate = "not-a-date";
      const dateFields = ["purchaseDateEnd", "createdOnEnd", "modifiedOnEnd"];

      for (const field of dateFields) {
        const mockRequest = { query: { [field]: invalidDate } };
        const result = await runValidation(
          medicalEquipmentFilterQueryValidation,
          mockRequest,
        );

        expect(result.isEmpty()).toBe(false);
        const errors = result.array();
        expect(errors).toContainEqual(
          expect.objectContaining({
            msg: `${field} must be a valid ISO date`,
          }),
        );
      }
    });
  });

  describe("Combined Filters", () => {
    it("should handle multiple valid filters", async () => {
      const mockRequest = {
        query: {
          status: ["Active", "Maintenance"],
          purchaseDateStart: "2023-01-01T00:00:00Z",
          purchaseDateEnd: "2023-12-31T00:00:00Z",
          createdOnStart: "2023-02-01T00:00:00Z",
          createdOnEnd: "2023-11-30T00:00:00Z",
          modifiedOnStart: "2023-03-01T00:00:00Z",
          modifiedOnEnd: "2023-10-31T00:00:00Z",
        },
      };

      const result = await runValidation(
        medicalEquipmentFilterQueryValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(true);

      expect(dateUtils.toJakartaDate).toHaveBeenCalledWith(
        "2023-01-01T00:00:00Z",
      );
      expect(dateUtils.toJakartaDate).toHaveBeenCalledWith(
        "2023-12-31T00:00:00Z",
        true,
      );
      expect(dateUtils.toJakartaDate).toHaveBeenCalledWith(
        "2023-02-01T00:00:00Z",
      );
      expect(dateUtils.toJakartaDate).toHaveBeenCalledWith(
        "2023-11-30T00:00:00Z",
        true,
      );
      expect(dateUtils.toJakartaDate).toHaveBeenCalledWith(
        "2023-03-01T00:00:00Z",
      );
      expect(dateUtils.toJakartaDate).toHaveBeenCalledWith(
        "2023-10-31T00:00:00Z",
        true,
      );
    });

    it("should fail with one invalid filter among valid ones", async () => {
      const mockRequest = {
        query: {
          status: ["Active"],
          purchaseDateStart: "2023-01-01T00:00:00Z",
          createdOnEnd: "invalid-date",
        },
      };

      const result = await runValidation(
        medicalEquipmentFilterQueryValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(false);

      const errors = result.array();
      expect(errors).toContainEqual(
        expect.objectContaining({
          msg: "createdOnEnd must be a valid ISO date",
        }),
      );
    });
  });
});
