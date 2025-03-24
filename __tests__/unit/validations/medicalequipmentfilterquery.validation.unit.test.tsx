import { validationResult } from "express-validator";
import { medicalEquipmentFilterQueryValidation } from "../../../src/validations/medicalequipmentfilterquery.validation";

describe("medicalEquipmentFilterQueryValidation", () => {
  // Shared validation runner
  const runValidations = async (query: object) => {
    const req = { query };
    await Promise.all(
      medicalEquipmentFilterQueryValidation.map((validation) => 
        validation(req, {} as any, () => {})
      )
    );
    return validationResult(req);
  };

  // Positive Cases
  describe("Positive Cases", () => {
    it("should pass for valid status (single or array)", async () => {
      const cases = [
        { status: "Active" },
        { status: ["Maintenance", "Inactive"] },
        { status: [] }, // Empty array
        { status: undefined }, // Undefined
      ];

      for (const query of cases) {
        const errors = await runValidations(query);
        expect(errors.isEmpty()).toBe(true);
      }
    });

    it("should pass for valid ISO dates and adjust end dates", async () => {
      const cases = [
        { 
          createdOnEnd: "2023-12-31T00:00:00Z",
          expected: new Date("2023-12-31T23:59:59.999Z")
        },
        { 
          modifiedOnEnd: "2023-12-31T00:00:00Z",
          expected: new Date("2023-12-31T23:59:59.999Z")
        },
        { 
          purchaseDateEnd: "2023-12-31T00:00:00Z",
          expected: new Date("2023-12-31T23:59:59.999Z")
        }
      ];

      for (const { expected, ...query } of cases) {
        const errors = await runValidations(query);
        expect(errors.isEmpty()).toBe(true);
        expect((query as any)[Object.keys(query)[0]]).toEqual(expected);
      }
    });
  });

  // Negative Cases
  describe("Negative Cases", () => {
    it("should reject invalid status values", async () => {
      const errors = await runValidations({ status: "InvalidStatus" });
      expect(errors.array()).toContainEqual(
        expect.objectContaining({
          msg: "status must contain Active, Maintenance, Inactive",
        })
      );
    });

    it("should reject invalid ISO dates", async () => {
      const dateFields = [
        "createdOnStart",
        "createdOnEnd",
        "modifiedOnStart",
        "modifiedOnEnd",
        "purchaseDateStart",
        "purchaseDateEnd"
      ];

      for (const field of dateFields) {
        const errors = await runValidations({ [field]: "invalid-date" });
        expect(errors.array()).toContainEqual(
          expect.objectContaining({
            msg: `${field} must be a valid ISO date`,
          })
        );
      }
    });
  });

  // Corner Cases
  describe("Corner Cases", () => {
    it("should sanitize falsy status values", async () => {
      const cases = [
        { input: null, expected: undefined },
        { input: undefined, expected: undefined }
      ];

      for (const { input, expected } of cases) {
        const req = { query: { status: input } };
        await Promise.all(
          medicalEquipmentFilterQueryValidation.map((validation) => 
            validation(req, {} as any, () => {})
          )
        );
        expect(req.query.status).toBe(expected);
      }
    });

    it("should handle mixed valid/invalid parameters", async () => {
      const errors = await runValidations({
        status: "Active",
        createdOnStart: "invalid-date" // One invalid param
      });
      
      expect(errors.array()).toContainEqual(
        expect.objectContaining({
          msg: "createdOnStart must be a valid ISO date",
        })
      );
    });
  });
});