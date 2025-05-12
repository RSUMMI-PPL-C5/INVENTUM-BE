import WhereClauseBuilder from "./where-clause.builder";
import { RequestFilterOptions } from "../../interfaces/request.filter.interface";

class RequestWhereBuilder extends WhereClauseBuilder {
  public buildAllFilters(filters?: RequestFilterOptions): this {
    if (!filters) return this;

    if (filters.status) {
      const statusArray = Array.isArray(filters.status)
        ? filters.status
        : [filters.status];
      this.buildEnumFilter("status", statusArray);
    }

    if (filters.userId) {
      this.whereClause.userId = filters.userId;
    }

    this.buildDateFilter(
      "createdOn",
      filters.createdOnStart,
      filters.createdOnEnd,
    );

    return this;
  }

  public buildRequestTypeFilter(requestType: string): this {
    if (requestType) {
      this.whereClause.requestType = requestType;
    }
    return this;
  }

  public buildSearchFilter(search?: string): this {
    return this.buildSearchCondition(search, ["medicalEquipment", "complaint"]);
  }

  public buildComplete(
    search?: string,
    filters?: RequestFilterOptions,
    requestType?: string,
  ): any {
    this.reset();

    if (search) {
      this.buildSearchFilter(search);
    }

    this.buildAllFilters(filters);

    if (requestType) {
      this.buildRequestTypeFilter(requestType);
    }

    return this.build();
  }
}

export default RequestWhereBuilder;
