import {
  CreatePartsHistoryDTO,
  PartsHistoryDTO,
} from "../dto/parts-history.dto";
import { PartsHistoryFilterOptions } from "../interfaces/parts-history.filter.interface";
import { PaginationOptions } from "../interfaces/pagination.interface";
import { v4 as uuidv4 } from "uuid";
import MedicalEquipmentRepository from "../repository/medical-equipment.repository";
import SparepartRepository from "../repository/sparepart.repository";
import PartsHistoryRepository from "../repository/parts-history.repository";
import { IPartsHistoryService } from "./interface/parts-history.service.interface";

class PartsHistoryService implements IPartsHistoryService {
  private readonly partsHistoryRepository: PartsHistoryRepository;
  private readonly medicalEquipmentRepository: MedicalEquipmentRepository;
  private readonly sparepartRepository: SparepartRepository;

  constructor() {
    this.partsHistoryRepository = new PartsHistoryRepository();
    this.medicalEquipmentRepository = new MedicalEquipmentRepository();
    this.sparepartRepository = new SparepartRepository();
  }

  public async createPartsHistory(
    partsData: CreatePartsHistoryDTO,
  ): Promise<PartsHistoryDTO> {
    const equipment =
      await this.medicalEquipmentRepository.getMedicalEquipmentById(
        partsData.medicalEquipmentId,
      );

    if (!equipment) {
      throw new Error(
        `Medical equipment with ID ${partsData.medicalEquipmentId} does not exist`,
      );
    }

    const sparepart = await this.sparepartRepository.getSparepartById(
      partsData.sparepartId,
    );

    if (!sparepart) {
      throw new Error(
        `Sparepart with ID ${partsData.sparepartId} does not exist`,
      );
    }

    const partsHistoryId = uuidv4();

    return await this.partsHistoryRepository.createPartsHistory({
      id: partsHistoryId,
      ...partsData,
    });
  }

  public async getPartsHistories(
    search?: string,
    filters?: PartsHistoryFilterOptions,
    pagination?: PaginationOptions,
  ) {
    if (filters?.medicalEquipmentId) {
      const equipment =
        await this.medicalEquipmentRepository.getMedicalEquipmentById(
          filters.medicalEquipmentId,
        );

      if (!equipment) {
        throw new Error(
          `Medical equipment with ID ${filters.medicalEquipmentId} does not exist`,
        );
      }
    }

    if (filters?.sparepartId) {
      const sparepart = await this.sparepartRepository.getSparepartById(
        filters.sparepartId,
      );

      if (!sparepart) {
        throw new Error(
          `Sparepart with ID ${filters.sparepartId} does not exist`,
        );
      }
    }

    const { partsHistories, total } =
      await this.partsHistoryRepository.getPartsHistories(
        search,
        filters,
        pagination,
      );

    const totalPages = pagination ? Math.ceil(total / pagination.limit) : 1;

    return {
      data: partsHistories,
      meta: {
        total,
        page: pagination?.page ?? 1,
        limit: pagination?.limit ?? partsHistories.length,
        totalPages,
      },
    };
  }
}

export default PartsHistoryService;
