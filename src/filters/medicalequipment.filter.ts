import { MedicalEquipmentFilterOptions } from "./interface/medicalequipment.filter.interface";
import { Prisma } from "@prisma/client";

export const hasFilters = (query: any): boolean => {
  const filterKeys: (keyof MedicalEquipmentFilterOptions)[] = [
    "status",
    "createdOnStart",
    "createdOnEnd",
    "modifiedOnStart",
    "modifiedOnEnd",
    "purchaseDateStart",
    "purchaseDateEnd",
  ];
  return filterKeys.some(
    (key) => query[key] !== undefined && query[key] !== null,
  );
};

type FilterHandler = (
  filters: MedicalEquipmentFilterOptions,
  whereClause: Prisma.MedicalEquipmentWhereInput,
) => void;

// Individual filter handlers
function handleStatusFilter(
  filters: MedicalEquipmentFilterOptions,
  whereClause: Prisma.MedicalEquipmentWhereInput,
): void {
  if (filters.status) {
    if (Array.isArray(filters.status)) {
      whereClause.status = { in: filters.status.map(String) };
    } else {
      const filter: string[] = [];
      filter.push(filters.status);
      whereClause.status = { in: filter.map(String) };
    }
  }
}

/**
 * Applies purchase date range filters to the provided query criteria.
 *
 * If either a start or end purchase date is specified in the filters object, this
 * function updates the whereClause by converting the provided timestamp(s) to Date
 * objects and setting them as the lower (gte) and/or upper (lte) boundaries for the
 * purchaseDate filter.
 *
 * @param filters - The object containing potential purchase date filter values.
 * @param whereClause - The query criteria to be updated with purchase date filters.
 */
function handlePurchaseDateFilter(
  filters: MedicalEquipmentFilterOptions,
  whereClause: Prisma.MedicalEquipmentWhereInput,
): void {
  if (filters.purchaseDateStart || filters.purchaseDateEnd) {
    whereClause.purchaseDate = {
      ...(filters.purchaseDateStart && {
        gte: new Date(filters.purchaseDateStart),
      }),
      ...(filters.purchaseDateEnd && {
        lte: new Date(filters.purchaseDateEnd),
      }),
    };
  }
}

function handleCreatedOnFilter(
  filters: MedicalEquipmentFilterOptions,
  whereClause: Prisma.MedicalEquipmentWhereInput,
): void {
  if (filters.createdOnStart || filters.createdOnEnd) {
    whereClause.createdOn = {
      ...(filters.createdOnStart && { gte: new Date(filters.createdOnStart) }),
      ...(filters.createdOnEnd && { lte: new Date(filters.createdOnEnd) }),
    };
  }
}

/**
 * Applies filtering logic to set the modifiedOn date range on a Prisma where clause.
 *
 * If either a start (modifiedOnStart) or end (modifiedOnEnd) date is specified in the filters,
 * this function converts the provided filter value(s) to Date objects and assigns them as
 * gte (start) and/or lte (end) boundaries on the modifiedOn field of the whereClause.
 *
 * @param filters - Filter options that may include modifiedOnStart and/or modifiedOnEnd dates.
 * @param whereClause - The Prisma where clause object that is updated with the modifiedOn filter.
 */
function handleModifiedOnFilter(
  filters: MedicalEquipmentFilterOptions,
  whereClause: Prisma.MedicalEquipmentWhereInput,
): void {
  if (filters.modifiedOnStart || filters.modifiedOnEnd) {
    whereClause.modifiedOn = {
      ...(filters.modifiedOnStart && {
        gte: new Date(filters.modifiedOnStart),
      }),
      ...(filters.modifiedOnEnd && { lte: new Date(filters.modifiedOnEnd) }),
    };
  }
}

// Export the array of filter handlers
export const filterHandlers: FilterHandler[] = [
  handleStatusFilter,
  handlePurchaseDateFilter,
  handleCreatedOnFilter,
  handleModifiedOnFilter,
];
