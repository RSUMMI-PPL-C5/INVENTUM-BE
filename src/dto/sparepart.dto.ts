import { Spareparts } from "@prisma/client";

export interface SparepartDTO extends Spareparts {}

export interface FilterSparepartDTO {
  partsName?: string;
  purchaseDateStart?: string;
  purchaseDateEnd?: string;
  priceMin?: number;
  priceMax?: number;
  toolLocation?: string;
}

export interface SparepartsDTO {
  id: string;
  partsName: string;
  purchaseDate?: Date | null;
  price?: number | null;
  toolLocation?: string | null;
  toolDate?: string | null;
  createdBy: number;
  createdOn?: Date | null;
  modifiedBy?: number | null;
  modifiedOn: Date;
  deletedBy?: number | null;
  deletedOn?: Date | null;
}
