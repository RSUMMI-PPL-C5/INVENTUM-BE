import SparepartWhereBuilder from "../../../../src/utils/builders/sparepart-where.builder";
import { SparepartFilterOptions } from "../../../../src/interfaces/spareparts.filter.interface";

describe("SparepartWhereBuilder", () => {
  let builder: SparepartWhereBuilder;

  beforeEach(() => {
    builder = new SparepartWhereBuilder();
  });

  describe("buildPartsNameFilter", () => {
    it("should add parts name filter when provided", () => {
      const partsName = "Engine Part";
      builder.buildPartsNameFilter(partsName);
      const result = builder.build();
      expect(result.partsName).toEqual({ contains: partsName });
    });

    it("should not add parts name filter when not provided", () => {
      builder.buildPartsNameFilter(undefined);
      const result = builder.build();
      expect(result.partsName).toBeUndefined();
    });
  });

  describe("buildToolLocationFilter", () => {
    it("should add tool location filter when provided", () => {
      const toolLocation = "Warehouse A";
      builder.buildToolLocationFilter(toolLocation);
      const result = builder.build();
      expect(result.toolLocation).toEqual({ contains: toolLocation });
    });

    it("should not add tool location filter when not provided", () => {
      builder.buildToolLocationFilter(undefined);
      const result = builder.build();
      expect(result.toolLocation).toBeUndefined();
    });
  });

  describe("buildPriceFilter", () => {
    it("should add price filter with min and max", () => {
      builder.buildPriceFilter(100, 500);
      const result = builder.build();
      expect(result.price).toEqual({
        gte: 100,
        lte: 500,
      });
    });

    it("should add price filter with only min", () => {
      builder.buildPriceFilter(100);
      const result = builder.build();
      expect(result.price).toEqual({
        gte: 100,
      });
    });

    it("should add price filter with only max", () => {
      builder.buildPriceFilter(undefined, 500);
      const result = builder.build();
      expect(result.price).toEqual({
        lte: 500,
      });
    });
  });

  describe("buildAllFilters", () => {
    it("should build all filters correctly", () => {
      const filters: SparepartFilterOptions = {
        partsName: "Engine Part",
        toolLocation: "Warehouse A",
        priceMin: 100,
        priceMax: 500,
        purchaseDateStart: new Date("2024-01-01"),
        purchaseDateEnd: new Date("2024-12-31"),
        createdOnStart: new Date("2024-01-01"),
        createdOnEnd: new Date("2024-12-31"),
        modifiedOnStart: new Date("2024-01-01"),
        modifiedOnEnd: new Date("2024-12-31"),
      };

      builder.buildAllFilters(filters);
      const result = builder.build();

      expect(result.partsName).toEqual({ contains: "Engine Part" });
      expect(result.toolLocation).toEqual({ contains: "Warehouse A" });
      expect(result.price).toEqual({
        gte: 100,
        lte: 500,
      });
      expect(result.purchaseDate).toBeDefined();
      expect(result.createdOn).toBeDefined();
      expect(result.modifiedOn).toBeDefined();
    });
  });

  describe("buildSearchFilter", () => {
    it("should build search filter correctly", () => {
      const search = "engine";
      builder.buildSearchFilter(search);
      const result = builder.build();

      expect(result.OR).toBeDefined();
      expect(result.OR).toHaveLength(2);
      expect(result.OR[0].partsName).toEqual({ contains: search });
      expect(result.OR[1].toolLocation).toEqual({ contains: search });
    });
  });

  describe("buildComplete", () => {
    it("should build complete where clause with all filters", () => {
      const search = "engine";
      const filters: SparepartFilterOptions = {
        partsName: "Engine Part",
        priceMin: 100,
        priceMax: 500,
      };

      const result = builder.buildComplete(search, filters);

      expect(result.deletedOn).toBeNull();
      expect(result.OR).toBeDefined();
      expect(result.partsName).toEqual({ contains: "Engine Part" });
      expect(result.price).toEqual({
        gte: 100,
        lte: 500,
      });
    });

    it("should build complete where clause without search", () => {
      const filters: SparepartFilterOptions = {
        partsName: "Engine Part",
      };

      const result = builder.buildComplete(undefined, filters);

      expect(result.deletedOn).toBeNull();
      expect(result.OR).toBeUndefined();
      expect(result.partsName).toEqual({ contains: "Engine Part" });
    });
  });
});
