import WhereClauseBuilder from "./where-clause.builder";
import { SparepartFilterOptions } from "../../interfaces/spareparts.filter.interface";

class SparepartWhereBuilder extends WhereClauseBuilder {
  public buildPartsNameFilter(partsName?: string): this {
    if (partsName) {
      this.buildStringFilter("partsName", partsName);
    }
    return this;
  }

  public buildToolLocationFilter(toolLocation?: string): this {
    if (toolLocation) {
      this.buildStringFilter("toolLocation", toolLocation);
    }
    return this;
  }

  public buildPriceFilter(min?: number, max?: number): this {
    return this.buildNumericFilter("price", min, max);
  }

  public buildAllFilters(filters?: SparepartFilterOptions): this {
    this.buildPartsNameFilter(filters?.partsName);
    this.buildToolLocationFilter(filters?.toolLocation);
    this.buildPriceFilter(filters?.priceMin, filters?.priceMax);

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
    return this.buildSearchCondition(search, ["partsName", "toolLocation"]);
  }

  public buildComplete(search?: string, filters?: SparepartFilterOptions): any {
    this.reset();
    this.excludeDeleted();
    if (search) {
      this.buildSearchFilter(search);
    }

    this.buildAllFilters(filters);

    return this.build();
  }
}
export default SparepartWhereBuilder;
