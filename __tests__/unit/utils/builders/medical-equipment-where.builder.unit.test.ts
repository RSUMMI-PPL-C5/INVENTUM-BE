import MedicalEquipmentWhereBuilder from "../../../../src/utils/builders/medical-equipment-where.builder";
import { MedicalEquipmentFilterOptions } from "../../../../src/interfaces/medical-equipment.filter.interface";

describe("MedicalEquipmentWhereBuilder", () => {
  let builder: MedicalEquipmentWhereBuilder;

  beforeEach(() => {
    builder = new MedicalEquipmentWhereBuilder();
  });

  describe("buildAllFilters", () => {
    it("should build all filters correctly", () => {
      const filters: MedicalEquipmentFilterOptions = {
        status: ["ACTIVE", "MAINTENANCE"],
        purchaseDateStart: new Date("2024-01-01"),
        purchaseDateEnd: new Date("2024-12-31"),
        createdOnStart: new Date("2024-01-01"),
        createdOnEnd: new Date("2024-12-31"),
        modifiedOnStart: new Date("2024-01-01"),
        modifiedOnEnd: new Date("2024-12-31"),
      };

      builder.buildAllFilters(filters);
      const result = builder.build();

      expect(result.status).toEqual({ in: ["ACTIVE", "MAINTENANCE"] });
      expect(result.purchaseDate).toBeDefined();
      expect(result.createdOn).toBeDefined();
      expect(result.modifiedOn).toBeDefined();
    });

    it("should not add status filter when status is empty", () => {
      const filters: MedicalEquipmentFilterOptions = {
        status: [],
      };

      builder.buildAllFilters(filters);
      const result = builder.build();

      expect(result.status).toBeUndefined();
    });
  });

  describe("buildSearchFilter", () => {
    it("should build search filter correctly", () => {
      const search = "x-ray";
      builder.buildSearchFilter(search);
      const result = builder.build();

      expect(result.OR).toBeDefined();
      expect(result.OR).toHaveLength(3);
      expect(result.OR[0].name).toEqual({ contains: search });
      expect(result.OR[1].lastLocation).toEqual({ contains: search });
      expect(result.OR[2].brandName).toEqual({ contains: search });
    });
  });

  describe("buildComplete", () => {
    it("should build complete where clause with all filters", () => {
      const search = "x-ray";
      const filters: MedicalEquipmentFilterOptions = {
        status: ["ACTIVE"],
        purchaseDateStart: new Date("2024-01-01"),
        purchaseDateEnd: new Date("2024-12-31"),
      };

      const result = builder.buildComplete(search, filters);

      expect(result.deletedOn).toBeNull();
      expect(result.OR).toBeDefined();
      expect(result.status).toEqual({ in: ["ACTIVE"] });
      expect(result.purchaseDate).toBeDefined();
    });

    it("should build complete where clause without search", () => {
      const filters: MedicalEquipmentFilterOptions = {
        status: ["ACTIVE"],
      };

      const result = builder.buildComplete(undefined, filters);

      expect(result.deletedOn).toBeNull();
      expect(result.OR).toBeUndefined();
      expect(result.status).toEqual({ in: ["ACTIVE"] });
    });
  });
});
