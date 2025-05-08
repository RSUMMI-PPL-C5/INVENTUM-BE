import WhereClauseBuilder from "./where-clause.builder";
import { CalibrationHistoryFilterOptions } from "../../interfaces/calibration-history.filter.interface";

class CalibrationHistoryWhereBuilder extends WhereClauseBuilder {
  public addNextCalibrationDueFilter(nextCalibrationDueBefore?: Date): this {
    if (nextCalibrationDueBefore) {
      this.whereClause.nextCalibrationDue = {
        lte: nextCalibrationDueBefore,
        not: null,
      };
    }
    return this;
  }

  public buildAllFilters(filters?: CalibrationHistoryFilterOptions): this {
    if (filters) {
      if (filters.medicalEquipmentId) {
        this.whereClause.medicalEquipmentId = filters.medicalEquipmentId;
      }

      if (filters.result && filters.result.length > 0) {
        this.buildEnumFilter("result", filters.result);
      }

      if (filters.calibrationMethod) {
        this.buildStringFilter("calibrationMethod", filters.calibrationMethod);
      }

      this.addNextCalibrationDueFilter(filters.nextCalibrationDueBefore);

      this.buildDateFilter(
        "calibrationDate",
        filters.calibrationDateStart,
        filters.calibrationDateEnd,
      );

      this.buildDateFilter(
        "createdOn",
        filters.createdOnStart,
        filters.createdOnEnd,
      );
    }

    return this;
  }

  public buildSearchFilter(search?: string): this {
    return this.buildSearchCondition(search, [
      "technician",
      "calibrationMethod",
    ]);
  }

  public buildComplete(
    search?: string,
    filters?: CalibrationHistoryFilterOptions,
  ): any {
    this.reset();

    if (search) {
      this.buildSearchFilter(search);
    }

    this.buildAllFilters(filters);

    return this.build();
  }
}
export default CalibrationHistoryWhereBuilder;
