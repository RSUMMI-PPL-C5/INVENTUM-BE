import { v4 as uuidv4 } from "uuid";
import { SparepartDTO, SparepartsDTO } from "../dto/sparepart.dto";
import { ISparepartService } from "./interface/sparepart.service.interface";
import SparepartRepository from "../repository/sparepart.repository";
import { PaginationOptions } from "../interfaces/pagination.interface";
import { SparepartFilterOptions } from "../interfaces/spareparts.filter.interface";

class SparepartService implements ISparepartService {
  private readonly sparepartRepository: SparepartRepository;

  constructor() {
    this.sparepartRepository = new SparepartRepository();
  }

  public async addSparepart(data: SparepartsDTO): Promise<SparepartsDTO> {
    if (
      !data.partsName ||
      typeof data.partsName !== "string" ||
      data.partsName.trim() === ""
    ) {
      throw new Error("Parts name is required and must be a valid string");
    }

    const { id, ...restData } = data;
    const createData = {
      id: uuidv4(),
      ...restData,
    };

    return await this.sparepartRepository.createSparepart(createData);
  }

  public async getSpareparts(
    search?: string,
    filters?: SparepartFilterOptions,
    pagination?: PaginationOptions,
  ) {
    const { spareparts, total } = await this.sparepartRepository.getSpareparts(
      search,
      filters,
      pagination,
    );

    const totalPages = pagination ? Math.ceil(total / pagination.limit) : 1;

    return {
      data: spareparts,
      meta: {
        total,
        page: pagination?.page ?? 1,
        limit: pagination?.limit ?? spareparts.length,
        totalPages,
      },
    };
  }

  public async getSparepartById(id: string): Promise<SparepartDTO | null> {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new Error("Sparepart ID is required and must be a valid string");
    }

    return await this.sparepartRepository.getSparepartById(id);
  }

  public async getSparepartByName(nameQuery: string): Promise<SparepartDTO[]> {
    if (!nameQuery || typeof nameQuery !== "string") {
      throw new Error("Name query is required and must be a valid string");
    }

    return await this.sparepartRepository.getSparepartByName(nameQuery);
  }

  public async updateSparepart(
    id: string,
    data: Partial<SparepartsDTO>,
  ): Promise<SparepartsDTO | null> {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new Error("Sparepart ID is required and must be a valid string");
    }

    const sparepart = await this.sparepartRepository.getSparepartById(id);
    if (!sparepart) {
      throw new Error("Sparepart not found");
    }

    if (data.partsName !== undefined && data.partsName.trim() === "") {
      throw new Error("Parts name cannot be empty");
    }

    const {
      id: _,
      createdOn,
      createdBy,
      deletedOn,
      deletedBy,
      ...updateData
    } = data;

    return await this.sparepartRepository.updateSparepart(id, updateData);
  }

  public async deleteSparepart(
    id: string,
    deletedById?: string,
  ): Promise<SparepartsDTO | null> {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new Error("Sparepart ID is required and must be a valid string");
    }

    const sparepart = await this.sparepartRepository.getSparepartById(id);
    if (!sparepart) {
      throw new Error("Sparepart not found");
    }

    return await this.sparepartRepository.deleteSparepart(id, deletedById);
  }
}

export default SparepartService;
