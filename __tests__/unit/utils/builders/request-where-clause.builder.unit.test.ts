import RequestWhereBuilder from "../../../../src/utils/builders/request-where.builder";
import { RequestFilterOptions } from "../../../../src/interfaces/request.filter.interface";

describe("RequestWhereBuilder", () => {
  let builder: RequestWhereBuilder;

  beforeEach(() => {
    builder = new RequestWhereBuilder();
    // Add spies to verify method calls
    jest.spyOn(builder, "buildEnumFilter");
    jest.spyOn(builder, "buildDateFilter");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("buildAllFilters", () => {
    // Tests focusing on the status filter conversion
    it("should handle status as array with multiple values", () => {
      // Setup: filters with status as array
      const filters: RequestFilterOptions = {
        status: ["Pending", "In Progress"],
      };

      // Action
      builder.buildAllFilters(filters);

      // Assertions
      expect(builder.buildEnumFilter).toHaveBeenCalledWith("status", [
        "Pending",
        "In Progress",
      ]);
      expect(builder.build()).toEqual({
        status: { in: ["Pending", "In Progress"] },
      });
    });

    it("should handle status as array with single value", () => {
      // Setup: filters with status as array containing one item
      const filters: RequestFilterOptions = {
        status: ["Pending"],
      };

      // Action
      builder.buildAllFilters(filters);

      // Assertions
      expect(builder.buildEnumFilter).toHaveBeenCalledWith("status", [
        "Pending",
      ]);
      expect(builder.build()).toEqual({
        status: { in: ["Pending"] },
      });
    });

    it("should convert single status string to array", () => {
      // Setup: filters with status as single string
      const filters: RequestFilterOptions = {
        status: "Pending" as any, // Using 'as any' to simulate when status might be sent as string
      };

      // Action
      builder.buildAllFilters(filters);

      // Assertions
      expect(builder.buildEnumFilter).toHaveBeenCalledWith("status", [
        "Pending",
      ]);
      expect(builder.build()).toEqual({
        status: { in: ["Pending"] },
      });
    });

    it("should not add status filter if status is undefined", () => {
      // Setup: filters without status
      const filters: RequestFilterOptions = {
        userId: "user-123",
      };

      // Action
      builder.buildAllFilters(filters);

      // Assertions
      expect(builder.buildEnumFilter).not.toHaveBeenCalled();
      expect(builder.build()).toEqual({
        userId: "user-123",
      });
    });

    it("should handle empty status array", () => {
      // Setup: filters with empty status array
      const filters: RequestFilterOptions = {
        status: [],
      };

      // Action
      builder.buildAllFilters(filters);

      // Assertions
      expect(builder.buildEnumFilter).toHaveBeenCalledWith("status", []);
      // The underlying buildEnumFilter should handle empty arrays and not add them to where clause
      expect(builder.build()).toEqual({});
    });

    // Tests for other filters
    it("should add userId filter correctly", () => {
      // Setup
      const filters: RequestFilterOptions = {
        userId: "user-123",
      };

      // Action
      builder.buildAllFilters(filters);

      // Assertions
      expect(builder.build()).toEqual({
        userId: "user-123",
      });
    });

    it("should add date filter correctly", () => {
      // Setup
      const startDate = new Date("2023-01-01");
      const endDate = new Date("2023-12-31");
      const filters: RequestFilterOptions = {
        createdOnStart: startDate,
        createdOnEnd: endDate,
      };

      // Action
      builder.buildAllFilters(filters);

      // Assertions
      expect(builder.buildDateFilter).toHaveBeenCalledWith(
        "createdOn",
        startDate,
        endDate,
      );
      expect(builder.build()).toEqual({
        createdOn: {
          gte: startDate,
          lte: endDate,
        },
      });
    });

    it("should handle undefined filters", () => {
      // Action
      builder.buildAllFilters();

      // Assertions
      expect(builder.buildEnumFilter).not.toHaveBeenCalled();
      expect(builder.buildDateFilter).not.toHaveBeenCalled();
      expect(builder.build()).toEqual({});
    });

    it("should handle all filters together", () => {
      // Setup
      const startDate = new Date("2023-01-01");
      const filters: RequestFilterOptions = {
        status: ["Pending", "In Progress"],
        userId: "user-123",
        createdOnStart: startDate,
      };

      // Action
      builder.buildAllFilters(filters);

      // Assertions
      expect(builder.buildEnumFilter).toHaveBeenCalledWith("status", [
        "Pending",
        "In Progress",
      ]);
      expect(builder.buildDateFilter).toHaveBeenCalledWith(
        "createdOn",
        startDate,
        undefined,
      );
      expect(builder.build()).toEqual({
        status: { in: ["Pending", "In Progress"] },
        userId: "user-123",
        createdOn: { gte: startDate },
      });
    });
  });

  describe("buildRequestTypeFilter", () => {
    it("should add requestType filter", () => {
      // Action
      builder.buildRequestTypeFilter("MAINTENANCE");

      // Assertions
      expect(builder.build()).toEqual({
        requestType: "MAINTENANCE",
      });
    });

    it("should not add requestType filter if value is empty", () => {
      // Action
      builder.buildRequestTypeFilter("");

      // Assertions
      expect(builder.build()).toEqual({});
    });

    it("should return this for method chaining", () => {
      // Action
      const result = builder.buildRequestTypeFilter("MAINTENANCE");

      // Assertions
      expect(result).toBe(builder);
    });
  });

  describe("buildSearchFilter", () => {
    it("should build search conditions for medicalEquipment and complaint", () => {
      // Action
      builder.buildSearchFilter("search term");

      // Assertions
      expect(builder.build()).toEqual({
        OR: [
          { medicalEquipment: { contains: "search term" } },
          { complaint: { contains: "search term" } },
        ],
      });
    });

    it("should not add search condition if search is undefined", () => {
      // Action
      builder.buildSearchFilter();

      // Assertions
      expect(builder.build()).toEqual({});
    });
  });

  describe("buildComplete", () => {
    it("should combine search, filters and requestType", () => {
      // Setup
      const search = "MRI";
      const filters: RequestFilterOptions = {
        status: ["Pending"],
        userId: "user-123",
      };
      const requestType = "MAINTENANCE";

      // Spies
      jest.spyOn(builder, "reset");
      jest.spyOn(builder, "buildSearchFilter");
      jest.spyOn(builder, "buildAllFilters");
      jest.spyOn(builder, "buildRequestTypeFilter");

      // Action
      const result = builder.buildComplete(search, filters, requestType);

      // Assertions
      expect(builder.reset).toHaveBeenCalled();
      expect(builder.buildSearchFilter).toHaveBeenCalledWith(search);
      expect(builder.buildAllFilters).toHaveBeenCalledWith(filters);
      expect(builder.buildRequestTypeFilter).toHaveBeenCalledWith(requestType);

      // Check resulting where clause
      expect(result).toEqual(
        expect.objectContaining({
          OR: expect.any(Array),
          status: expect.any(Object),
          userId: "user-123",
          requestType: "MAINTENANCE",
        }),
      );
    });

    it("should work with only search parameter", () => {
      // Action
      const result = builder.buildComplete("MRI");

      // Assertions
      expect(result).toEqual({
        OR: [
          { medicalEquipment: { contains: "MRI" } },
          { complaint: { contains: "MRI" } },
        ],
      });
    });

    it("should work with only filters parameter", () => {
      // Setup
      const filters: RequestFilterOptions = {
        status: ["Pending"],
      };

      // Action
      const result = builder.buildComplete(undefined, filters);

      // Assertions
      expect(result).toEqual({
        status: { in: ["Pending"] },
      });
    });

    it("should work with only requestType parameter", () => {
      // Action
      const result = builder.buildComplete(undefined, undefined, "CALIBRATION");

      // Assertions
      expect(result).toEqual({
        requestType: "CALIBRATION",
      });
    });

    it("should handle all parameters being undefined", () => {
      // Action
      const result = builder.buildComplete();

      // Assertions
      expect(result).toEqual({});
    });
  });
});
