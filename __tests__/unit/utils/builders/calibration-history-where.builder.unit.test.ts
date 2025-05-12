import CalibrationHistoryWhereBuilder from "../../../../src/utils/builders/calibration-history-where.builder";
import { CalibrationHistoryFilterOptions } from "../../../../src/interfaces/calibration-history.filter.interface";

describe("CalibrationHistoryWhereBuilder", () => {
  let builder: CalibrationHistoryWhereBuilder;

  beforeEach(() => {
    builder = new CalibrationHistoryWhereBuilder();
  });

  describe("addNextCalibrationDueFilter", () => {
    it("should add next calibration due filter when date is provided", () => {
      const nextCalibrationDueBefore = new Date("2024-12-31");
      builder.addNextCalibrationDueFilter(nextCalibrationDueBefore);
      const result = builder.build();

      expect(result.nextCalibrationDue).toEqual({
        lte: nextCalibrationDueBefore,
        not: null,
      });
    });

    it("should not add next calibration due filter when date is not provided", () => {
      builder.addNextCalibrationDueFilter(undefined);
      const result = builder.build();

      expect(result.nextCalibrationDue).toBeUndefined();
    });
  });

  describe("buildAllFilters", () => {
    it("should build all filters correctly", () => {
      const filters: CalibrationHistoryFilterOptions = {
        medicalEquipmentId: "1",
        result: ["SUCCESS", "FAILED"],
        calibrationMethod: "Standard Method",
        nextCalibrationDueBefore: new Date("2024-12-31"),
        calibrationDateStart: new Date("2024-01-01"),
        calibrationDateEnd: new Date("2024-12-31"),
        createdOnStart: new Date("2024-01-01"),
        createdOnEnd: new Date("2024-12-31"),
      };

      builder.buildAllFilters(filters);
      const result = builder.build();

      expect(result.medicalEquipmentId).toBe("1");
      expect(result.result).toEqual({ in: ["SUCCESS", "FAILED"] });
      expect(result.calibrationMethod).toEqual({ contains: "Standard Method" });
      expect(result.nextCalibrationDue).toEqual({
        lte: filters.nextCalibrationDueBefore,
        not: null,
      });
      expect(result.calibrationDate).toBeDefined();
      expect(result.createdOn).toBeDefined();
    });

    it("should not add filters when filters object is undefined", () => {
      builder.buildAllFilters(undefined);
      const result = builder.build();

      expect(result.medicalEquipmentId).toBeUndefined();
      expect(result.result).toBeUndefined();
      expect(result.calibrationMethod).toBeUndefined();
      expect(result.nextCalibrationDue).toBeUndefined();
      expect(result.calibrationDate).toBeUndefined();
      expect(result.createdOn).toBeUndefined();
    });

    it("should not add result filter when result array is empty", () => {
      const filters: CalibrationHistoryFilterOptions = {
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
      expect(result.OR).toHaveLength(2);
      expect(result.OR[0].technician).toEqual({ contains: search });
      expect(result.OR[1].calibrationMethod).toEqual({ contains: search });
    });
  });

  describe("buildComplete", () => {
    it("should build complete where clause with all filters", () => {
      const search = "john";
      const filters: CalibrationHistoryFilterOptions = {
        medicalEquipmentId: "1",
        result: ["SUCCESS"],
        calibrationMethod: "Standard Method",
      };

      const result = builder.buildComplete(search, filters);

      expect(result.OR).toBeDefined();
      expect(result.medicalEquipmentId).toBe("1");
      expect(result.result).toEqual({ in: ["SUCCESS"] });
      expect(result.calibrationMethod).toEqual({ contains: "Standard Method" });
    });

    it("should build complete where clause without search", () => {
      const filters: CalibrationHistoryFilterOptions = {
        medicalEquipmentId: "1",
      };

      const result = builder.buildComplete(undefined, filters);

      expect(result.OR).toBeUndefined();
      expect(result.medicalEquipmentId).toBe("1");
    });
  });
});
