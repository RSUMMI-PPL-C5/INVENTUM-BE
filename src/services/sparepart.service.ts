import { Prisma } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import {
  SparepartDTO,
  SparepartsDTO,
  FilterSparepartDTO,
} from "../dto/sparepart.dto";
import { ISparepartService } from "./interface/sparepart.service.interface";
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

    if (filters.partsName) {
      whereClause.partsName = { contains: filters.partsName };
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

  public async addSparepart(data: SparepartsDTO): Promise<SparepartsDTO> {
    const createData: SparepartsDTO = {
      id: uuidv4(),
      partsName: data.partsName,
      purchaseDate: data.purchaseDate,
      price: data.price,
      toolLocation: data.toolLocation,
      toolDate: data.toolDate,
      createdBy: data.createdBy,
      createdOn: new Date(),
      modifiedOn: new Date(),
    };

    return await this.sparepartRepository.createSparepart(createData);
  }

  public async updateSparepart(
    id: string,
    data: Partial<SparepartsDTO>,
  ): Promise<SparepartsDTO | null> {
    const sparepart = await this.sparepartRepository.getSparepartById(id);
    if (!sparepart || !this.validateSparepartData(data)) {
      return null;
    }

    const updatedData: Partial<SparepartsDTO> = {
      partsName: data.partsName,
      purchaseDate: data.purchaseDate,
      price: data.price,
      toolLocation: data.toolLocation,
      toolDate: data.toolDate,
      modifiedBy: data.modifiedBy,
      modifiedOn: new Date(),
    };

    return await this.sparepartRepository.updateSparepart(id, updatedData);
  }

  public async deleteSparepart(id: string): Promise<SparepartsDTO | null> {
    const sparepart = await this.sparepartRepository.getSparepartById(id);
    if (!sparepart) {
      return null;
    }

    const deletedData: Partial<SparepartsDTO> = {
      deletedOn: new Date(),
    };

    // Note: If you implement soft delete, call updateSparepart instead
    return await this.sparepartRepository.deleteSparepart(id);
  }

  private validateSparepartData(data: Partial<SparepartsDTO>): boolean {
    if (!data.modifiedBy) return false;
    if (data.partsName && data.partsName.trim().length === 0) return false;
    if (data.price && data.price < 0) return false;
    return true;
  }
}

export default SparepartService;
