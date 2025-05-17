import { Request } from "express";
import { ValidationChain, validationResult } from "express-validator";
import {
  addMedicalEquipmentValidation,
  updateMedicalEquipmentValidation,
  medicalEquipmentFilterQueryValidation,
} from "../../../src/validations/medical-equipment.validation";
import * as dateUtils from "../../../src/utils/date.utils";

const getErrorField = (error: any): string => {
  return error.path;
};

const getErrorMessage = (error: any): string => {
  return error.msg;
};

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

describe("Medical Equipment Validations", () => {
  describe("Add Medical Equipment Validation", () => {
    test("should export an array with 8 validation rules", () => {
      expect(Array.isArray(addMedicalEquipmentValidation)).toBe(true);
      expect(addMedicalEquipmentValidation).toHaveLength(9);
    });

    test("should pass validation with valid data", async () => {
      const mockRequest = {
        body: {
          inventorisId: "INV-001",
          name: "X-Ray Machine",
          brandName: "MedTech",
          modelName: "XT-2000",
          purchaseDate: "2023-01-15",
          purchasePrice: 5000,
          status: "Active",
          vendor: "Medical Supplies Inc.",
          lastLocation: "Room 101",
        },
      };

      const result = await runValidation(
        addMedicalEquipmentValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(true);
    });

    test("should fail when required fields are missing", async () => {
      const mockRequest = {
        body: {
          brandName: "MedTech",
          modelName: "XT-2000",
        },
      };

      const result = await runValidation(
        addMedicalEquipmentValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(false);

      const errors = result.array();
      expect(errors.some((e) => getErrorField(e) === "inventorisId")).toBe(
        true,
      );
      expect(errors.some((e) => getErrorField(e) === "name")).toBe(true);
      expect(errors.some((e) => getErrorField(e) === "status")).toBe(true);
    });

    test("should fail when status is invalid", async () => {
      const mockRequest = {
        body: {
          inventorisId: "INV-001",
          name: "X-Ray Machine",
          status: "NotAValidStatus",
        },
      };

      const result = await runValidation(
        addMedicalEquipmentValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(false);

      const errors = result.array();
      const statusError = errors.find((e) => getErrorField(e) === "status");
      expect(statusError).toBeDefined();
      expect(getErrorMessage(statusError)).toBe(
        "Status must be Active, Inactive, or Maintenance",
      );
    });

    test("should fail when purchase date is invalid", async () => {
      const mockRequest = {
        body: {
          inventorisId: "INV-001",
          name: "X-Ray Machine",
          status: "Active",
          purchaseDate: "not-a-date",
        },
      };

      const result = await runValidation(
        addMedicalEquipmentValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(false);

      const errors = result.array();
      const dateError = errors.find((e) => getErrorField(e) === "purchaseDate");
      expect(dateError).toBeDefined();
      expect(dateError?.msg).toBe("Purchase date must be a valid date");
    });

    test("should fail when purchase date is in the future", async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const mockRequest = {
        body: {
          inventorisId: "INV-001",
          name: "X-Ray Machine",
          status: "Active",
          purchaseDate: futureDate.toISOString(),
        },
      };

      const result = await runValidation(
        addMedicalEquipmentValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(false);

      const errors = result.array();
      const dateError = errors.find((e) => getErrorField(e) === "purchaseDate");
      expect(dateError).toBeDefined();
      expect(dateError?.msg).toBe("Purchase date cannot be in the future");
    });

    test("should fail when purchase price is negative", async () => {
      const mockRequest = {
        body: {
          inventorisId: "INV-001",
          name: "X-Ray Machine",
          status: "Active",
          purchasePrice: -100,
        },
      };

      const result = await runValidation(
        addMedicalEquipmentValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(false);

      const errors = result.array();
      const priceError = errors.find(
        (e) => getErrorField(e) === "purchasePrice",
      );
      expect(priceError).toBeDefined();
      expect(priceError?.msg).toBe("Price cannot be negative");
    });
  });

  describe("Update Medical Equipment Validation", () => {
    test("should export an array with 8 validation rules", () => {
      expect(Array.isArray(updateMedicalEquipmentValidation)).toBe(true);
      expect(updateMedicalEquipmentValidation).toHaveLength(9);
    });

    test("should pass validation with valid data", async () => {
      const mockRequest = {
        body: {
          name: "Updated Machine Name",
          status: "Maintenance",
          purchasePrice: 6000,
          lastLocation: "Room 102",
        },
      };

      const result = await runValidation(
        updateMedicalEquipmentValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(true);
    });

    test("should pass with empty body (no fields to update)", async () => {
      const mockRequest = { body: {} };

      const result = await runValidation(
        updateMedicalEquipmentValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(true);
    });

    test("should fail when provided inventorisId is empty", async () => {
      const mockRequest = {
        body: {
          inventorisId: "",
        },
      };

      const result = await runValidation(
        updateMedicalEquipmentValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(false);

      const errors = result.array();
      const idError = errors.find((e) => getErrorField(e) === "inventorisId");
      expect(idError).toBeDefined();
      expect(idError?.msg).toBe("Inventoris ID cannot be empty if provided");
    });

    test("should fail when status is invalid", async () => {
      const mockRequest = {
        body: {
          status: "NotAValidStatus",
        },
      };

      const result = await runValidation(
        updateMedicalEquipmentValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(false);

      const errors = result.array();
      const statusError = errors.find((e) => getErrorField(e) === "status");
      expect(statusError).toBeDefined();
      expect(getErrorMessage(statusError)).toBe(
        "Status must be Active, Inactive, or Maintenance",
      );
    });

    test("should fail when purchase date is in the future", async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const mockRequest = {
        body: {
          purchaseDate: futureDate.toISOString(),
        },
      };

      const result = await runValidation(
        updateMedicalEquipmentValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(false);

      const errors = result.array();
      const dateError = errors.find((e) => getErrorField(e) === "purchaseDate");
      expect(dateError).toBeDefined();
      expect(dateError?.msg).toBe("Purchase date cannot be in the future");
    });

    test("should pass when purchase date is today", async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mockRequest = {
        body: {
          inventorisId: "INV-001",
          name: "X-Ray Machine",
          status: "Active",
          purchaseDate: today.toISOString(),
        },
      };

      const result = await runValidation(
        addMedicalEquipmentValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(true);
    });

    test("should pass when purchase date is valid past date for update", async () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);

      const mockRequest = {
        body: {
          purchaseDate: pastDate.toISOString(),
        },
      };

      const result = await runValidation(
        updateMedicalEquipmentValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(true);
    });

    test("should pass when purchase date is today for update", async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mockRequest = {
        body: {
          purchaseDate: today.toISOString(),
        },
      };

      const result = await runValidation(
        updateMedicalEquipmentValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(true);
    });

    test("should fail when purchase price is negative", async () => {
      const mockRequest = {
        body: {
          purchasePrice: -100,
        },
      };

      const result = await runValidation(
        updateMedicalEquipmentValidation,
        mockRequest,
      );
      expect(result.isEmpty()).toBe(false);

      const errors = result.array();
      const priceError = errors.find(
        (e) => getErrorField(e) === "purchasePrice",
      );
      expect(priceError).toBeDefined();
      expect(priceError?.msg).toBe("Price cannot be negative");
    });
  });
});

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
