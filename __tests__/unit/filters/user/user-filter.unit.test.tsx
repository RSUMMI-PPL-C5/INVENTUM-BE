import { hasFilters, filterHandlers } from "../../../../src/filters/user.filter";
import { Prisma } from "@prisma/client";

describe("User Filter", () => {
  describe("hasFilters", () => {
    it("should return true if at least one filter is present", () => {
      const query = { role: "ADMIN" };
      expect(hasFilters(query)).toBe(true);
    });

    it("should return false if no filters are present", () => {
      const query = {};
      expect(hasFilters(query)).toBe(false);
    });

    it("should return true if multiple filters are present", () => {
      const query = { role: "USER", divisiId: 1 };
      expect(hasFilters(query)).toBe(true);
    });
  });

  describe("filterHandlers", () => {
    let whereClause: Prisma.UserWhereInput;
  
    beforeEach(() => {
      whereClause = {};
    });
  
    it("should handle role filter with a single role", () => {
      const filters = { role: ["ADMIN"] }; // Single role
      filterHandlers[0](filters, whereClause); // handleRoleFilter
      expect(whereClause).toEqual({
        role: { in: ["ADMIN"] },
      });
    });
  
    it("should handle role filter with multiple roles", () => {
      const filters = { role: ["ADMIN", "USER"] }; // Multiple roles
      filterHandlers[0](filters, whereClause); // handleRoleFilter
      expect(whereClause).toEqual({
        role: { in: ["ADMIN", "USER"] },
      });
    });
  
    it("should handle division filter with a single divisiId", () => {
      const filters = { divisiId: [1] }; // Single divisiId
      filterHandlers[1](filters, whereClause); // handleDivisionFilter
      expect(whereClause).toEqual({
        divisiId: { in: [1] },
      });
    });
  
    it("should handle division filter with multiple divisiIds", () => {
      const filters = { divisiId: [1, 2, 3] }; // Multiple divisiIds
      filterHandlers[1](filters, whereClause); // handleDivisionFilter
      expect(whereClause).toEqual({
        divisiId: { in: [1, 2, 3] },
      });
    });

    it("should handle createdOn filter with start date only", () => {
        const filters = { createdOnStart: new Date("2023-01-01") };
        filterHandlers[2](filters, whereClause);
        expect(whereClause).toEqual({
            createdOn: { gte: new Date("2023-01-01") },
        });
    });

    it("should handle createdOn filter with end date only", () => {
      const filters = { createdOnEnd: new Date("2025-01-31") };
      filterHandlers[2](filters, whereClause); // handleCreatedOnFilter
      expect(whereClause).toEqual({
        createdOn: { lte: new Date("2025-01-31") },
      });
    });

    it("should handle createdOn filter with both start and end dates", () => {
      const filters = {
        createdOnStart: new Date("2025-01-01"),
        createdOnEnd: new Date("2025-01-31"),
      };
      filterHandlers[2](filters, whereClause); // handleCreatedOnFilter
      expect(whereClause).toEqual({
        createdOn: {
          gte: new Date("2025-01-01"),
          lte: new Date("2025-01-31"),
        },
      });
    });

    it("should handle modifiedOn filter with start date only", () => {
      const filters = { modifiedOnStart: new Date("2025-02-01") };
      filterHandlers[3](filters, whereClause); // handleModifiedOnFilter
      expect(whereClause).toEqual({
        modifiedOn: { gte: new Date("2025-02-01") },
      });
    });

    it("should handle modifiedOn filter with end date only", () => {
      const filters = { modifiedOnEnd: new Date("2025-02-28") };
      filterHandlers[3](filters, whereClause); // handleModifiedOnFilter
      expect(whereClause).toEqual({
        modifiedOn: { lte: new Date("2025-02-28") },
      });
    });

    it("should handle modifiedOn filter with both start and end dates", () => {
      const filters = {
        modifiedOnStart: new Date("2025-02-01"),
        modifiedOnEnd: new Date("2025-02-28"),
      };
      filterHandlers[3](filters, whereClause); // handleModifiedOnFilter
      expect(whereClause).toEqual({
        modifiedOn: {
          gte: new Date("2025-02-01"),
          lte: new Date("2025-02-28"),
        },
      });
    });

    it("should not modify whereClause if no filters are provided", () => {
      const filters = {};
      filterHandlers.forEach((handler) => handler(filters, whereClause));
      expect(whereClause).toEqual({});
    });
  });
});