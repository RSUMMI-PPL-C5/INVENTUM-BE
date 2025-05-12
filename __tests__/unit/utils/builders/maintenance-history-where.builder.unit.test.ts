import MaintenanceHistoryWhereBuilder from "../../../../src/utils/builders/maintenance-history-where.builder";
import { MaintenanceHistoryFilterOptions } from "../../../../src/interfaces/maintenance-history.filter.interface";

describe("MaintenanceHistoryWhereBuilder", () => {
  let builder: MaintenanceHistoryWhereBuilder;

  beforeEach(() => {
    builder = new MaintenanceHistoryWhereBuilder();
  });

  describe("buildAllFilters", () => {
    it("should build all filters correctly", () => {
      const filters: MaintenanceHistoryFilterOptions = {
        medicalEquipmentId: "1",
        result: ["SUCCESS", "FAILED"],
        maintenanceDateStart: new Date("2024-01-01"),
        maintenanceDateEnd: new Date("2024-12-31"),
        createdOnStart: new Date("2024-01-01"),
        createdOnEnd: new Date("2024-12-31"),
      };

      builder.buildAllFilters(filters);
      const result = builder.build();

      expect(result.medicalEquipmentId).toBe("1");
      expect(result.result).toEqual({ in: ["SUCCESS", "FAILED"] });
      expect(result.maintenanceDate).toBeDefined();
      expect(result.createdOn).toBeDefined();
    });

    it("should not add filters when filters object is undefined", () => {
      builder.buildAllFilters(undefined);
      const result = builder.build();

      expect(result.medicalEquipmentId).toBeUndefined();
      expect(result.result).toBeUndefined();
      expect(result.maintenanceDate).toBeUndefined();
      expect(result.createdOn).toBeUndefined();
    });

    it("should not add result filter when result array is empty", () => {
      const filters: MaintenanceHistoryFilterOptions = {
        result: [],
      };

      builder.buildAllFilters(filters);
      const result = builder.build();

      expect(result.result).toBeUndefined();
    });
  });

  describe("buildSearchFilter", () => {
    it("should build search filter correctly", () => {
      const search = "john";
      builder.buildSearchFilter(search);
      const result = builder.build();

      expect(result.OR).toBeDefined();
      expect(result.OR).toHaveLength(1);
      expect(result.OR[0].technician).toEqual({ contains: search });
    });
  });

  describe("buildComplete", () => {
    it("should build complete where clause with all filters", () => {
      const search = "john";
      const filters: MaintenanceHistoryFilterOptions = {
        medicalEquipmentId: "1",
        result: ["SUCCESS"],
      };

      const result = builder.buildComplete(search, filters);

      expect(result.OR).toBeDefined();
      expect(result.medicalEquipmentId).toBe("1");
      expect(result.result).toEqual({ in: ["SUCCESS"] });
    });

    it("should build complete where clause without search", () => {
      const filters: MaintenanceHistoryFilterOptions = {
        medicalEquipmentId: "1",
      };

      const result = builder.buildComplete(undefined, filters);

      expect(result.OR).toBeUndefined();
      expect(result.medicalEquipmentId).toBe("1");
    });
  });
});
