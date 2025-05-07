import WhereClauseBuilder from "./where-clause.builder";
import { UserFilterOptions } from "../../interfaces/user.filter.interface";

class UserWhereBuilder extends WhereClauseBuilder {
  public buildRoleFilter(roles?: string[]): this {
    if (roles && roles.length > 0) {
      this.buildEnumFilter("role", roles);
    }
    return this;
  }

  public buildDivisiFilter(divisiIds?: number[]): this {
    if (divisiIds && divisiIds.length > 0) {
      this.buildEnumFilter("divisiId", divisiIds);
    }
    return this;
  }

  public buildAllFilters(filters?: UserFilterOptions): this {
    this.buildRoleFilter(filters?.role);
    this.buildDivisiFilter(filters?.divisiId);

    this.buildDateFilter(
      "createdOn",
      filters?.createdOnStart,
      filters?.createdOnEnd,
    );

    this.buildDateFilter(
      "modifiedOn",
      filters?.modifiedOnStart,
      filters?.modifiedOnEnd,
    );

    return this;
  }

  public buildSearchFilter(search?: string): this {
    return this.buildSearchCondition(search, ["fullname", "email", "username"]);
  }

  public buildComplete(search?: string, filters?: UserFilterOptions): any {
    this.reset();
    this.excludeDeleted();
    if (search) {
      this.buildSearchFilter(search);
    }

    this.buildAllFilters(filters);

    return this.build();
  }
}
export default UserWhereBuilder;
