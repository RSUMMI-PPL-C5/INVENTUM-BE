export interface UserFilterOptions {
  role?: string[];
  divisiId?: number[];
  createdOnStart?: Date;
  createdOnEnd?: Date;
  modifiedOnStart?: Date;
  modifiedOnEnd?: Date;
}

export interface PaginationOptions {
    page: number;
    limit: number;
    skip?: number;
}
