import { Prisma } from "@prisma/client";
import { ISparepartService } from "./interface/sparepart.service.interface";
import { SparepartDTO, FilterSparepartDTO } from "../dto/sparepart.dto";
import SparepartRepository from "../repository/sparepart.repository";

class SparepartService implements ISparepartService {
  private readonly sparepartRepository: SparepartRepository;

  constructor() {
    this.sparepartRepository = new SparepartRepository();
  }

  public async getSpareparts(): Promise<SparepartDTO[]> {
    return await this.sparepartRepository.getSpareparts();
  }

  public async getSparepartById(id: string): Promise<SparepartDTO | null> {
    return await this.sparepartRepository.getSparepartById(id);
  }

  public async getFilteredSpareparts(
    filters: FilterSparepartDTO,
  ): Promise<SparepartDTO[]> {
    const whereClause: Prisma.SparepartsWhereInput = {};

    // Apply filters if they exist
    if (filters.partsName) {
      whereClause.partsName = {
        contains: filters.partsName,
      };
    }

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

    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      whereClause.price = {
        ...(filters.priceMin !== undefined && { gte: filters.priceMin }),
        ...(filters.priceMax !== undefined && { lte: filters.priceMax }),
      };
    }

    if (filters.toolLocation) {
      whereClause.toolLocation = {
        contains: filters.toolLocation,
      };
    }

    return await this.sparepartRepository.getFilteredSpareparts(whereClause);
  }
}

export default SparepartService;
