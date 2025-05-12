import WhereClauseBuilder from "./where-clause.builder";
import { PartsHistoryFilterOptions } from "../../interfaces/parts-history.filter.interface";

class PartsHistoryWhereBuilder extends WhereClauseBuilder {
  public buildAllFilters(filters?: PartsHistoryFilterOptions): this {
    if (!filters) return this;

    if (filters.medicalEquipmentId) {
      this.whereClause.medicalEquipmentId = filters.medicalEquipmentId;
    }

    if (filters.sparepartId) {
      this.whereClause.sparepartId = filters.sparepartId;
    }

    if (filters.result && filters.result.length > 0) {
      this.buildEnumFilter("result", filters.result);
    }

    this.buildDateFilter(
      "replacementDate",
      filters.replacementDateStart,
      filters.replacementDateEnd,
    );

    this.buildDateFilter(
      "createdOn",
      filters.createdOnStart,
      filters.createdOnEnd,
    );

    return this;
  }

  public buildSearchFilter(search?: string): this {
    return this.buildSearchCondition(search, ["technician"]);
  }

  public buildComplete(
    search?: string,
    filters?: PartsHistoryFilterOptions,
  ): any {
    this.reset();
    if (search) {
      this.buildSearchFilter(search);
    }

    this.buildAllFilters(filters);

    return this.build();
  }
}

export default PartsHistoryWhereBuilder;
