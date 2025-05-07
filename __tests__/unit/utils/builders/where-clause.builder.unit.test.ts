import WhereClauseBuilder from "../../../../src/utils/builders/where-clause.builder";

describe("WhereClauseBuilder", () => {
  let builder: WhereClauseBuilder;

  beforeEach(() => {
    builder = new WhereClauseBuilder();
  });

  describe("reset", () => {
    it("should reset the where clause to an empty object", () => {
      // Setup: add some conditions to the where clause
      builder.buildStringFilter("fieldName", "value");

      // Action: reset the builder
      builder.reset();

      // Assertion: verify the where clause is empty
      expect(builder.build()).toEqual({});
    });

    it("should return this for method chaining", () => {
      // Setup & Action
      const result = builder.reset();

      // Assertion
      expect(result).toBe(builder);
    });
  });

  describe("excludeDeleted", () => {
    it("should add the deletedOn is null condition", () => {
      // Action
      builder.excludeDeleted();

      // Assertion
      expect(builder.build()).toEqual({ deletedOn: null });
    });

    it("should return this for method chaining", () => {
      // Action
      const result = builder.excludeDeleted();

      // Assertion
      expect(result).toBe(builder);
    });
  });

  describe("buildSearchCondition", () => {
    it("should build search conditions for multiple fields", () => {
      // Action
      builder.buildSearchCondition("searchTerm", ["field1", "field2"]);

      // Assertion
      expect(builder.build()).toEqual({
        OR: [
          { field1: { contains: "searchTerm" } },
          { field2: { contains: "searchTerm" } },
        ],
      });
    });

    it("should build search condition for a single field", () => {
      // Action
      builder.buildSearchCondition("searchTerm", ["field1"]);

      // Assertion
      expect(builder.build()).toEqual({
        OR: [{ field1: { contains: "searchTerm" } }],
      });
    });

    it("should not add search condition if search is undefined", () => {
      // Action
      builder.buildSearchCondition(undefined, ["field1", "field2"]);

      // Assertion
      expect(builder.build()).toEqual({});
    });

    it("should not add search condition if fields array is empty", () => {
      // Action
      builder.buildSearchCondition("searchTerm", []);

      // Assertion
      expect(builder.build()).toEqual({});
    });

    it("should not add search condition if fields array is undefined", () => {
      // Action
      builder.buildSearchCondition("searchTerm");

      // Assertion
      expect(builder.build()).toEqual({});
    });

    it("should return this for method chaining", () => {
      // Action
      const result = builder.buildSearchCondition("searchTerm", ["field1"]);

      // Assertion
      expect(result).toBe(builder);
    });
  });

  describe("buildDateFilter", () => {
    it("should build date filter with start and end date", () => {
      // Setup
      const startDate = new Date("2023-01-01");
      const endDate = new Date("2023-12-31");

      // Action
      builder.buildDateFilter("createdOn", startDate, endDate);

      // Assertion
      expect(builder.build()).toEqual({
        createdOn: {
          gte: startDate,
          lte: endDate,
        },
      });
    });

    it("should build date filter with only start date", () => {
      // Setup
      const startDate = new Date("2023-01-01");

      // Action
      builder.buildDateFilter("createdOn", startDate);

      // Assertion
      expect(builder.build()).toEqual({
        createdOn: {
          gte: startDate,
        },
      });
    });

    it("should build date filter with only end date", () => {
      // Setup
      const endDate = new Date("2023-12-31");

      // Action
      builder.buildDateFilter("createdOn", undefined, endDate);

      // Assertion
      expect(builder.build()).toEqual({
        createdOn: {
          lte: endDate,
        },
      });
    });

    it("should convert string dates to Date objects", () => {
      // Action
      builder.buildDateFilter("createdOn", "2023-01-01", "2023-12-31");

      // Assertion
      expect(builder.build().createdOn.gte).toBeInstanceOf(Date);
      expect(builder.build().createdOn.lte).toBeInstanceOf(Date);
    });

    it("should not add date filter if both dates are undefined", () => {
      // Action
      builder.buildDateFilter("createdOn");

      // Assertion
      expect(builder.build()).toEqual({});
    });

    it("should return this for method chaining", () => {
      // Action
      const result = builder.buildDateFilter("createdOn", new Date());

      // Assertion
      expect(result).toBe(builder);
    });
  });

  describe("buildEnumFilter", () => {
    // Testing line 48 specifically - "const valueArray = Array.isArray(values) ? values : [values];"

    it("should handle array of values", () => {
      // Setup: array with multiple elements
      const statusValues = ["PENDING", "IN_PROGRESS"];

      // Action
      builder.buildEnumFilter("status", statusValues);

      // Assertion
      expect(builder.build()).toEqual({
        status: { in: statusValues },
      });
    });

    it("should handle array with single element", () => {
      // Setup: array with single element
      const statusValues = ["PENDING"];

      // Action
      builder.buildEnumFilter("status", statusValues);

      // Assertion
      expect(builder.build()).toEqual({
        status: { in: statusValues },
      });
    });

    it("should convert single value to array", () => {
      // Setup: single value (not in array)
      const statusValue = "PENDING";

      // Action
      builder.buildEnumFilter("status", statusValue);

      // Assertion
      expect(builder.build()).toEqual({
        status: { in: [statusValue] },
      });
    });

    it("should not add filter if values is an empty array", () => {
      // Setup: empty array
      const statusValues: string[] = [];

      // Action
      builder.buildEnumFilter("status", statusValues);

      // Assertion
      expect(builder.build()).toEqual({});
    });

    it("should not add filter if values is undefined", () => {
      // Action
      builder.buildEnumFilter("status");

      // Assertion
      expect(builder.build()).toEqual({});
    });

    it("should handle numeric values", () => {
      // Action
      builder.buildEnumFilter("priority", [1, 2, 3]);

      // Assertion
      expect(builder.build()).toEqual({
        priority: { in: [1, 2, 3] },
      });
    });

    it("should handle single numeric value", () => {
      // Action
      builder.buildEnumFilter("priority", 1);

      // Assertion
      expect(builder.build()).toEqual({
        priority: { in: [1] },
      });
    });

    it("should return this for method chaining", () => {
      // Action
      const result = builder.buildEnumFilter("status", ["PENDING"]);

      // Assertion
      expect(result).toBe(builder);
    });
  });

  describe("buildStringFilter", () => {
    it("should build string filter with contains operator", () => {
      // Action
      builder.buildStringFilter("name", "John");

      // Assertion
      expect(builder.build()).toEqual({
        name: { contains: "John" },
      });
    });

    it("should not add filter if value is undefined", () => {
      // Action
      builder.buildStringFilter("name");

      // Assertion
      expect(builder.build()).toEqual({});
    });

    it("should not add filter if value is an empty string", () => {
      // Action
      builder.buildStringFilter("name", "");

      // Assertion
      expect(builder.build()).toEqual({});
    });

    it("should return this for method chaining", () => {
      // Action
      const result = builder.buildStringFilter("name", "John");

      // Assertion
      expect(result).toBe(builder);
    });
  });

  describe("buildNumericFilter", () => {
    it("should build numeric filter with min and max", () => {
      // Action
      builder.buildNumericFilter("price", 10, 100);

      // Assertion
      expect(builder.build()).toEqual({
        price: {
          gte: 10,
          lte: 100,
        },
      });
    });

    it("should build numeric filter with only min", () => {
      // Action
      builder.buildNumericFilter("price", 10);

      // Assertion
      expect(builder.build()).toEqual({
        price: {
          gte: 10,
        },
      });
    });

    it("should build numeric filter with only max", () => {
      // Action
      builder.buildNumericFilter("price", undefined, 100);

      // Assertion
      expect(builder.build()).toEqual({
        price: {
          lte: 100,
        },
      });
    });

    it("should handle zero as a valid min value", () => {
      // Action
      builder.buildNumericFilter("quantity", 0, 100);

      // Assertion
      expect(builder.build()).toEqual({
        quantity: {
          gte: 0,
          lte: 100,
        },
      });
    });

    it("should handle zero as a valid max value", () => {
      // Action
      builder.buildNumericFilter("temperature", -50, 0);

      // Assertion
      expect(builder.build()).toEqual({
        temperature: {
          gte: -50,
          lte: 0,
        },
      });
    });

    it("should not add filter if both min and max are undefined", () => {
      // Action
      builder.buildNumericFilter("price");

      // Assertion
      expect(builder.build()).toEqual({});
    });

    it("should return this for method chaining", () => {
      // Action
      const result = builder.buildNumericFilter("price", 10, 100);

      // Assertion
      expect(result).toBe(builder);
    });
  });

  describe("build", () => {
    it("should return a copy of the where clause", () => {
      // Setup
      builder.buildStringFilter("name", "John");

      // Action
      const result = builder.build();

      // Assertion
      expect(result).toEqual({ name: { contains: "John" } });

      // Verify it's a copy by modifying the returned object
      result.additionalField = "value";
      expect(builder.build()).not.toHaveProperty("additionalField");
    });

    it("should combine multiple conditions", () => {
      // Setup & Action
      builder
        .buildStringFilter("name", "John")
        .buildNumericFilter("age", 18, 30)
        .buildEnumFilter("status", ["ACTIVE"])
        .excludeDeleted();

      // Assertion
      expect(builder.build()).toEqual({
        name: { contains: "John" },
        age: { gte: 18, lte: 30 },
        status: { in: ["ACTIVE"] },
        deletedOn: null,
      });
    });
  });

  describe("method chaining", () => {
    it("should support chaining multiple methods", () => {
      // Action
      const result = builder
        .reset()
        .excludeDeleted()
        .buildStringFilter("name", "John")
        .buildEnumFilter("status", "ACTIVE")
        .build();

      // Assertion
      expect(result).toEqual({
        deletedOn: null,
        name: { contains: "John" },
        status: { in: ["ACTIVE"] },
      });
    });
  });
});
