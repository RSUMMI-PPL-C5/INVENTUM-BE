import WhereClauseBuilder from "./where-clause.builder";
import { MedicalEquipmentFilterOptions } from "../../interfaces/medical-equipment.filter.interface";

class MedicalEquipmentWhereBuilder extends WhereClauseBuilder {
  public buildAllFilters(filters?: MedicalEquipmentFilterOptions): this {
    if (filters?.status && filters.status.length > 0) {
      this.buildEnumFilter("status", filters.status);
    }

    this.buildDateFilter(
      "purchaseDate",
      filters?.purchaseDateStart,
      filters?.purchaseDateEnd,
    );

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
    return this.buildSearchCondition(search, [
      "name",
      "lastLocation",
      "brandName",
    ]);
  }

  public buildComplete(
    search?: string,
    filters?: MedicalEquipmentFilterOptions,
  ): any {
    this.reset();
    this.excludeDeleted();
    if (search) {
      this.buildSearchFilter(search);
    }

    this.buildAllFilters(filters);

    return this.build();
  }
}
export default MedicalEquipmentWhereBuilder;
