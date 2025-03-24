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
  return filterKeys.some((key) => 
    query[key] !== undefined && query[key] !== null
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

function handlePurchaseDateFilter(
  filters: MedicalEquipmentFilterOptions,
  whereClause: Prisma.MedicalEquipmentWhereInput,
): void {
  if (filters.purchaseDateStart || filters.purchaseDateEnd) {
    whereClause.purchaseDate = {
      ...(filters.purchaseDateStart && { gte: new Date(filters.purchaseDateStart) }),
      ...(filters.purchaseDateEnd && { lte: new Date(filters.purchaseDateEnd) }),
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

function handleModifiedOnFilter(
  filters: MedicalEquipmentFilterOptions,
  whereClause: Prisma.MedicalEquipmentWhereInput,
): void {
  if (filters.modifiedOnStart || filters.modifiedOnEnd) {
    whereClause.modifiedOn = {
      ...(filters.modifiedOnStart && { gte: new Date(filters.modifiedOnStart) }),
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