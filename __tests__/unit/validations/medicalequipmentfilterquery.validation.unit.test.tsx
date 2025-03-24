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

    it("should pass for valid start ISO dates", async () => {
      const testDate = "2023-12-31T00:00:00Z";
      const expectedDate = new Date(testDate);
      
      const cases = [
        { createdOnStart: testDate },
        { modifiedOnStart: testDate },
        { purchaseDateStart: testDate }
      ];

      for (const query of cases) {
        const errors = await runValidations(query);
        expect(errors.isEmpty()).toBe(true);
        expect((query as any)[Object.keys(query)[0]]).toEqual(expectedDate);
      }
    });

    it("should pass for valid end ISO dates and adjust them to end of day", async () => {
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

    it("should reject mixed valid/invalid status values in array", async () => {
      const errors = await runValidations({ status: ["Active", "InvalidStatus"] });
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
    it("should handle array passed directly to status sanitizer", async () => {
      const statusArray = ["Active", "Maintenance"];
      const req = { query: { status: statusArray } };
      
      await Promise.all(
        medicalEquipmentFilterQueryValidation.map((validation) => 
          validation(req, {} as any, () => {})
        )
      );
      
      expect(req.query.status).toBe(statusArray);
      
      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });

    it("should sanitize falsy status values", async () => {
      const cases = [
        { input: null, expected: undefined },
        { input: "", expected: undefined },
        { input: false, expected: undefined },
        { input: 0, expected: undefined }
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

    it("should handle invalid dates in end date sanitizers", async () => {
      const invalidDateFields = [
        "createdOnEnd",
        "modifiedOnEnd", 
        "purchaseDateEnd"
      ];
      
      for (const field of invalidDateFields) {
        const req = { query: { [field]: "invalid-date" } };
        
        const validation = medicalEquipmentFilterQueryValidation.find(v => 
          (v as any).builder.fields.includes(field)
        );
        
        if (validation) {
          await validation(req, {} as any, () => {});
          expect((req.query[field] as any) instanceof Date).toBe(true);
          expect(isNaN((req.query[field] as unknown as Date).getTime())).toBe(true);
        }
      }
    });

    it("should handle multiple parameters together", async () => {
      const query = {
        status: ["Active", "Maintenance"],
        createdOnStart: "2023-01-01T00:00:00Z",
        createdOnEnd: "2023-12-31T00:00:00Z",
        modifiedOnStart: "2023-02-01T00:00:00Z",
        modifiedOnEnd: "2023-11-30T00:00:00Z",
        purchaseDateStart: "2023-03-01T00:00:00Z",
        purchaseDateEnd: "2023-10-31T00:00:00Z",
      };
      
      const errors = await runValidations(query);
      expect(errors.isEmpty()).toBe(true);
      
      expect(query.createdOnEnd).toEqual(new Date("2023-12-31T23:59:59.999Z"));
      expect(query.modifiedOnEnd).toEqual(new Date("2023-11-30T23:59:59.999Z"));
      expect(query.purchaseDateEnd).toEqual(new Date("2023-10-31T23:59:59.999Z"));
    });
  });
});