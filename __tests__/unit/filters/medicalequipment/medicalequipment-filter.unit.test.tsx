// medicalequipment.filter.spec.ts
import { MedicalEquipmentFilterOptions } from "../../../../src/filters/interface/medicalequipment.filter.interface";
import { Prisma } from "@prisma/client";
import { hasFilters, filterHandlers } from "../../../../src/filters/medicalequipment.filter";

describe("MedicalEquipmentFilter", () => {
  // ==================================================
  // hasFilters()
  // ==================================================
  describe("hasFilters()", () => {
    it("should return false when no filters are present", () => {
      expect(hasFilters({})).toBe(false);
    });

    it("should return true when at least one filter is present (positive cases)", () => {
      const filters: (keyof MedicalEquipmentFilterOptions)[] = [
        "status",
        "createdOnStart",
        "createdOnEnd",
        "modifiedOnStart",
        "modifiedOnEnd",
        "purchaseDateStart",
        "purchaseDateEnd",
      ];

      filters.forEach((filter) => {
        expect(hasFilters({ [filter]: "test" })).toBe(true);
      });
    });

    it("should handle undefined/null values correctly (negative cases)", () => {
      expect(hasFilters({ status: undefined })).toBe(false);
      expect(hasFilters({ createdOnStart: null })).toBe(false);
    });
  });

  // ==================================================
  // Filter Handlers
  // ==================================================
  describe("Filter Handlers", () => {
    let whereClause: Prisma.MedicalEquipmentWhereInput;
    const mockDateStart = new Date("2024-01-01");
    const mockDateEnd = new Date("2024-12-31");

    beforeEach(() => {
      whereClause = {};
    });

    // --------------------------------------------------
    // handleStatusFilter()
    // --------------------------------------------------
    describe("handleStatusFilter()", () => {
      it("should handle array input", () => {
        const filters: MedicalEquipmentFilterOptions = {
          status: ["ACTIVE", "INACTIVE"],
        };

        filterHandlers[0](filters, whereClause);
        expect(whereClause.status).toEqual({ in: ["ACTIVE", "INACTIVE"] });
      });

      it("should handle single string input", () => {
        const filters: MedicalEquipmentFilterOptions = {
          status: ["PENDING"],
        };

        filterHandlers[0](filters, whereClause);
        expect(whereClause.status).toEqual({ in: ["PENDING"] });
      });

      it("should handle empty array (corner case)", () => {
        const filters: MedicalEquipmentFilterOptions = {
          status: [],
        };

        filterHandlers[0](filters, whereClause);
        expect(whereClause.status).toEqual({ in: [] });
      });

      it("should do nothing when status is undefined", () => {
        const filters: MedicalEquipmentFilterOptions = {};
        filterHandlers[0](filters, whereClause);
        expect(whereClause.status).toBeUndefined();
      });

      it("should handle null status value", () => {
        const filters: MedicalEquipmentFilterOptions = {
          status: null as any,
        };

        filterHandlers[0](filters, whereClause);
        expect(whereClause.status).toBeUndefined();
      });
      
      // Add this test to cover the specific branch that might be in lines 33-35
      it("should handle non-array status value", () => {
        const filters = {
          status: "ACTIVE" as any  // Passing a string directly instead of array
        };

        filterHandlers[0](filters, whereClause);
        expect(whereClause.status).toEqual({ in: ["ACTIVE"] });
      });
    });

    // --------------------------------------------------
    // handlePurchaseDateFilter()
    // --------------------------------------------------
    describe("handlePurchaseDateFilter()", () => {
      it("should handle start date only", () => {
        const filters: MedicalEquipmentFilterOptions = {
          purchaseDateStart: mockDateStart,
        };

        filterHandlers[1](filters, whereClause);
        expect(whereClause.purchaseDate).toEqual({ gte: mockDateStart });
      });

      it("should handle end date only", () => {
        const filters: MedicalEquipmentFilterOptions = {
          purchaseDateEnd: mockDateEnd,
        };

        filterHandlers[1](filters, whereClause);
        expect(whereClause.purchaseDate).toEqual({ lte: mockDateEnd });
      });

      it("should handle both dates", () => {
        const filters: MedicalEquipmentFilterOptions = {
          purchaseDateStart: mockDateStart,
          purchaseDateEnd: mockDateEnd,
        };

        filterHandlers[1](filters, whereClause);
        expect(whereClause.purchaseDate).toEqual({
          gte: mockDateStart,
          lte: mockDateEnd,
        });
      });

      it("should do nothing when no dates are provided", () => {
        const filters: MedicalEquipmentFilterOptions = {};
        filterHandlers[1](filters, whereClause);
        expect(whereClause.purchaseDate).toBeUndefined();
      });
    });

    // --------------------------------------------------
    // handleCreatedOnFilter()
    // --------------------------------------------------
    describe("handleCreatedOnFilter()", () => {
      it("should handle date range combinations", () => {
        // Test start only
        filterHandlers[2]({ createdOnStart: mockDateStart }, whereClause);
        expect(whereClause.createdOn).toEqual({ gte: mockDateStart });

        // Reset and test end only
        whereClause = {};
        filterHandlers[2]({ createdOnEnd: mockDateEnd }, whereClause);
        expect(whereClause.createdOn).toEqual({ lte: mockDateEnd });

        // Reset and test both
        whereClause = {};
        filterHandlers[2](
          { createdOnStart: mockDateStart, createdOnEnd: mockDateEnd },
          whereClause
        );
        expect(whereClause.createdOn).toEqual({
          gte: mockDateStart,
          lte: mockDateEnd,
        });
      });
    });

    // --------------------------------------------------
    // handleModifiedOnFilter()
    // --------------------------------------------------
    describe("handleModifiedOnFilter()", () => {
      it("should handle edge cases with identical dates", () => {
        const identicalDate = new Date("2024-06-15");
        const filters: MedicalEquipmentFilterOptions = {
          modifiedOnStart: identicalDate,
          modifiedOnEnd: identicalDate,
        };

        filterHandlers[3](filters, whereClause);
        expect(whereClause.modifiedOn).toEqual({
          gte: identicalDate,
          lte: identicalDate,
        });
      });

      it("should handle invalid date format (negative case)", () => {
        const filters = {
          modifiedOnStart: "invalid-date",
        } as unknown as MedicalEquipmentFilterOptions;

        filterHandlers[3](filters, whereClause);
        expect((whereClause.modifiedOn as Prisma.DateTimeFilter).gte).toBeInstanceOf(Date);
      });
    });

    // --------------------------------------------------
    // filterHandlers integration
    // --------------------------------------------------
    it("should apply multiple filters correctly", () => {
      const filters: MedicalEquipmentFilterOptions = {
        status: ["ACTIVE"],
        purchaseDateStart: mockDateStart,
        createdOnEnd: mockDateEnd,
      };

      filterHandlers.forEach((handler) => handler(filters, whereClause));

      expect(whereClause).toEqual({
        status: { in: ["ACTIVE"] },
        purchaseDate: { gte: mockDateStart },
        createdOn: { lte: mockDateEnd },
      });
    });
  });
});