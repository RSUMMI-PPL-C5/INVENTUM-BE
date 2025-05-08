import UserWhereBuilder from "../../../../src/utils/builders/user-where.builder";
import { UserFilterOptions } from "../../../../src/interfaces/user.filter.interface";

describe("UserWhereBuilder", () => {
  let builder: UserWhereBuilder;

  beforeEach(() => {
    builder = new UserWhereBuilder();
  });

  describe("buildRoleFilter", () => {
    it("should add role filter when roles are provided", () => {
      const roles = ["ADMIN", "USER"];
      builder.buildRoleFilter(roles);
      const result = builder.build();
      expect(result.role).toEqual({ in: roles });
    });

    it("should not add role filter when roles are empty", () => {
      builder.buildRoleFilter([]);
      const result = builder.build();
      expect(result.role).toBeUndefined();
    });
  });

  describe("buildDivisiFilter", () => {
    it("should add divisi filter when divisiIds are provided", () => {
      const divisiIds = [1, 2, 3];
      builder.buildDivisiFilter(divisiIds);
      const result = builder.build();
      expect(result.divisiId).toEqual({ in: divisiIds });
    });

    it("should not add divisi filter when divisiIds are empty", () => {
      builder.buildDivisiFilter([]);
      const result = builder.build();
      expect(result.divisiId).toBeUndefined();
    });
  });

  describe("buildAllFilters", () => {
    it("should build all filters correctly", () => {
      const filters: UserFilterOptions = {
        role: ["ADMIN"],
        divisiId: [1],
        createdOnStart: new Date("2024-01-01"),
        createdOnEnd: new Date("2024-12-31"),
        modifiedOnStart: new Date("2024-01-01"),
        modifiedOnEnd: new Date("2024-12-31"),
      };

      builder.buildAllFilters(filters);
      const result = builder.build();

      expect(result.role).toEqual({ in: ["ADMIN"] });
      expect(result.divisiId).toEqual({ in: [1] });
      expect(result.createdOn).toBeDefined();
      expect(result.modifiedOn).toBeDefined();
    });
  });

  describe("buildSearchFilter", () => {
    it("should build search filter correctly", () => {
      const search = "john";
      builder.buildSearchFilter(search);
      const result = builder.build();

      expect(result.OR).toBeDefined();
      expect(result.OR).toHaveLength(3);
      expect(result.OR[0].fullname).toEqual({ contains: search });
      expect(result.OR[1].email).toEqual({ contains: search });
      expect(result.OR[2].username).toEqual({ contains: search });
    });
  });

  describe("buildComplete", () => {
    it("should build complete where clause with all filters", () => {
      const search = "john";
      const filters: UserFilterOptions = {
        role: ["ADMIN"],
        divisiId: [1],
      };

      const result = builder.buildComplete(search, filters);

      expect(result.deletedOn).toBeNull();
      expect(result.OR).toBeDefined();
      expect(result.role).toEqual({ in: ["ADMIN"] });
      expect(result.divisiId).toEqual({ in: [1] });
    });

    it("should build complete where clause without search", () => {
      const filters: UserFilterOptions = {
        role: ["ADMIN"],
      };

      const result = builder.buildComplete(undefined, filters);

      expect(result.deletedOn).toBeNull();
      expect(result.OR).toBeUndefined();
      expect(result.role).toEqual({ in: ["ADMIN"] });
    });
  });
});
