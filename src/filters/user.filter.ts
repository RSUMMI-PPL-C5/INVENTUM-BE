import { UserFilterOptions } from "./interface/user.filter.interface";
import { Prisma } from "@prisma/client";

export const hasFilters = (query: any): boolean => {
  const filterKeys: (keyof UserFilterOptions)[] = [
    "role",
    "divisiId",
    "createdOnStart",
    "createdOnEnd",
    "modifiedOnStart",
    "modifiedOnEnd",
  ];
  return filterKeys.some((key) => query[key] !== undefined);
};

type FilterHandler = (
  filters: UserFilterOptions,
  whereClause: Prisma.UserWhereInput,
) => void;

// Individual filter handlers
function handleRoleFilter(
  filters: UserFilterOptions,
  whereClause: Prisma.UserWhereInput,
): void {

  if (filters.role) {

    if (Array.isArray(filters.role)) {
        whereClause.role = { in: filters.role.map(String) };

    } else {
        const filter : string [] = []
        filter.push(filters.role)
        whereClause.role = { in: filter.map(String) };
    }
  }
}

function handleDivisionFilter(
  filters: UserFilterOptions,
  whereClause: Prisma.UserWhereInput,
): void {

    if (filters.divisiId) {

        if (Array.isArray(filters.divisiId)) {
            whereClause.divisiId = { in: filters.divisiId.map(Number) };
    
        } else {
            const filter : number [] = []
            filter.push(filters.divisiId)
            whereClause.divisiId = { in: filter.map(Number) };
        }
      }
}

function handleCreatedOnFilter(
  filters: UserFilterOptions,
  whereClause: Prisma.UserWhereInput,
): void {
  if (filters.createdOnStart || filters.createdOnEnd) {
    whereClause.createdOn = {
      ...(filters.createdOnStart && { gte: new Date(filters.createdOnStart) }),
      ...(filters.createdOnEnd && { lte: new Date(filters.createdOnEnd) }),
    };
  }
}

function handleModifiedOnFilter(
  filters: UserFilterOptions,
  whereClause: Prisma.UserWhereInput,
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
  handleRoleFilter,
  handleDivisionFilter,
  handleCreatedOnFilter,
  handleModifiedOnFilter,
];
