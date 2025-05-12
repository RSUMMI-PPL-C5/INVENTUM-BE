import WhereClauseBuilder from "./where-clause.builder";
import { MaintenanceHistoryFilterOptions } from "../../interfaces/maintenance-history.filter.interface";

class MaintenanceHistoryWhereBuilder extends WhereClauseBuilder {
  public buildAllFilters(filters?: MaintenanceHistoryFilterOptions): this {
    if (filters) {
      if (filters.medicalEquipmentId) {
        this.whereClause.medicalEquipmentId = filters.medicalEquipmentId;
      }

      if (filters.result && filters.result.length > 0) {
        this.buildEnumFilter("result", filters.result);
      }

      this.buildDateFilter(
        "maintenanceDate",
        filters.maintenanceDateStart,
        filters.maintenanceDateEnd,
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
    return this.buildSearchCondition(search, ["technician"]);
  }

  public buildComplete(
    search?: string,
    filters?: MaintenanceHistoryFilterOptions,
  ): any {
    this.reset();

    if (search) {
      this.buildSearchFilter(search);
    }

    this.buildAllFilters(filters);

    return this.build();
  }
}
export default MaintenanceHistoryWhereBuilder;
