import { SparepartsDTO } from "../dto/sparepart.dto";
import { ISparepartService } from "./interface/sparepart.service.interface";
import SparepartRepository from "../repository/sparepart.repository";
import { v4 as uuidv4 } from "uuid";

class SparepartService implements ISparepartService {
  private readonly sparepartRepository: SparepartRepository;

  constructor() {
    this.sparepartRepository = new SparepartRepository();
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

  private validateSparepartData(data: Partial<SparepartsDTO>): boolean {
    if (!data.modifiedBy) return false;
    if (data.partsName && data.partsName.trim().length === 0) return false;
    if (data.price && data.price < 0) return false;
    return true;
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

    return await this.sparepartRepository.deleteSparepart(id);
  }
}

export default SparepartService;
