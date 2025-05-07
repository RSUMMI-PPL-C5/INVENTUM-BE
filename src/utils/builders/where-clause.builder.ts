class WhereClauseBuilder {
  protected whereClause: any = {};

  constructor() {
    this.reset();
  }

  public reset(): this {
    this.whereClause = {};
    return this;
  }

  public excludeDeleted(): this {
    this.whereClause.deletedOn = null;
    return this;
  }

  public buildSearchCondition(search?: string, fields?: string[]): this {
    if (search && fields && fields.length > 0) {
      this.whereClause.OR = fields.map((field) => ({
        [field]: { contains: search },
      }));
    }
    return this;
  }

  public buildDateFilter(
    fieldName: string,
    startDate?: string | Date,
    endDate?: string | Date,
  ): this {
    if (startDate || endDate) {
      this.whereClause[fieldName] = {};

      if (startDate) {
        this.whereClause[fieldName].gte = new Date(startDate);
      }

      if (endDate) {
        this.whereClause[fieldName].lte = new Date(endDate);
      }
    }
    return this;
  }

  public buildEnumFilter(fieldName: string, values?: any): this {
    if (values) {
      const valueArray = Array.isArray(values) ? values : [values];

      if (valueArray.length > 0) {
        this.whereClause[fieldName] = { in: valueArray };
      }
    }
    return this;
  }

  public buildStringFilter(fieldName: string, value?: string): this {
    if (value) {
      this.whereClause[fieldName] = { contains: value };
    }
    return this;
  }

  public buildNumericFilter(
    fieldName: string,
    min?: number,
    max?: number,
  ): this {
    if (min !== undefined || max !== undefined) {
      this.whereClause[fieldName] = {};

      if (min !== undefined) {
        this.whereClause[fieldName].gte = min;
      }

      if (max !== undefined) {
        this.whereClause[fieldName].lte = max;
      }
    }
    return this;
  }

  public build(): any {
    return { ...this.whereClause };
  }
}
export default WhereClauseBuilder;
