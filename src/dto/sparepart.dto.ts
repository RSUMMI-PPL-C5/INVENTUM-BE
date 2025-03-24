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