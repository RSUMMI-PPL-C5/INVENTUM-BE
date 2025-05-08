import PartsHistoryWhereBuilder from "../../../../src/utils/builders/parts-history-where.builder";
import { PartsHistoryFilterOptions } from "../../../../src/interfaces/parts-history.filter.interface";

describe("PartsHistoryWhereBuilder", () => {
  let builder: PartsHistoryWhereBuilder;

  beforeEach(() => {
    builder = new PartsHistoryWhereBuilder();
  });

  describe("buildAllFilters", () => {
    it("should build all filters correctly", () => {
      const filters: PartsHistoryFilterOptions = {
        medicalEquipmentId: "1",
        sparepartId: "2",
        result: ["SUCCESS", "FAILED"],
        replacementDateStart: new Date("2024-01-01"),
        replacementDateEnd: new Date("2024-12-31"),
        createdOnStart: new Date("2024-01-01"),
        createdOnEnd: new Date("2024-12-31"),
      };

      builder.buildAllFilters(filters);
      const result = builder.build();

      expect(result.medicalEquipmentId).toBe("1");
      expect(result.sparepartId).toBe("2");
      expect(result.result).toEqual({ in: ["SUCCESS", "FAILED"] });
      expect(result.replacementDate).toBeDefined();
      expect(result.createdOn).toBeDefined();
    });

    it("should not add filters when filters object is undefined", () => {
      builder.buildAllFilters(undefined);
      const result = builder.build();

      expect(result.medicalEquipmentId).toBeUndefined();
      expect(result.sparepartId).toBeUndefined();
      expect(result.result).toBeUndefined();
      expect(result.replacementDate).toBeUndefined();
      expect(result.createdOn).toBeUndefined();
    });

    it("should not add result filter when result array is empty", () => {
      const filters: PartsHistoryFilterOptions = {
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
      const filters: PartsHistoryFilterOptions = {
        medicalEquipmentId: "1",
        sparepartId: "2",
        result: ["SUCCESS"],
      };

      const result = builder.buildComplete(search, filters);

      expect(result.OR).toBeDefined();
      expect(result.medicalEquipmentId).toBe("1");
      expect(result.sparepartId).toBe("2");
      expect(result.result).toEqual({ in: ["SUCCESS"] });
    });

    it("should build complete where clause without search", () => {
      const filters: PartsHistoryFilterOptions = {
        medicalEquipmentId: "1",
      };

      const result = builder.buildComplete(undefined, filters);

      expect(result.OR).toBeUndefined();
      expect(result.medicalEquipmentId).toBe("1");
    });
  });
});
