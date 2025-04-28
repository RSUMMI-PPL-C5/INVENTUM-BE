import { IMaintenanceHistoryService } from "./interface/maintenance-history.service.interface";
import {
  CreateMaintenanceHistoryDTO,
  MaintenanceHistoryDTO,
} from "../dto/maintenance-history.dto";
import { MaintenanceHistoryFilterOptions } from "../interfaces/maintenance-history.filter.interface";
import { PaginationOptions } from "../interfaces/pagination.interface";
import { v4 as uuidv4 } from "uuid";
import MedicalEquipmentRepository from "../repository/medical-equipment.repository";
import MaintenanceHistoryRepository from "../repository/maintenance-history.repository";

class MaintenanceHistoryService implements IMaintenanceHistoryService {
  private readonly maintenanceHistoryRepository: MaintenanceHistoryRepository;
  private readonly medicalEquipmentRepository: MedicalEquipmentRepository;

  constructor() {
    this.maintenanceHistoryRepository = new MaintenanceHistoryRepository();
    this.medicalEquipmentRepository = new MedicalEquipmentRepository();
  }

  public async createMaintenanceHistory(
    maintenanceData: CreateMaintenanceHistoryDTO,
  ): Promise<MaintenanceHistoryDTO> {
    const equipment =
      await this.medicalEquipmentRepository.getMedicalEquipmentById(
        maintenanceData.medicalEquipmentId,
      );

    if (!equipment) {
      throw new Error(
        `Medical equipment with ID ${maintenanceData.medicalEquipmentId} does not exist`,
      );
    }

    const maintenanceHistoryId = uuidv4();

    return await this.maintenanceHistoryRepository.createMaintenanceHistory({
      id: maintenanceHistoryId,
      ...maintenanceData,
    });
  }

  public async getMaintenanceHistories(
    search?: string,
    filters?: MaintenanceHistoryFilterOptions,
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

    const { maintenanceHistories, total } =
      await this.maintenanceHistoryRepository.getMaintenanceHistories(
        search,
        filters,
        pagination,
      );

    const totalPages = pagination ? Math.ceil(total / pagination.limit) : 1;

    return {
      data: maintenanceHistories,
      meta: {
        total,
        page: pagination?.page ?? 1,
        limit: pagination?.limit ?? maintenanceHistories.length,
        totalPages,
      },
    };
  }
}

export default MaintenanceHistoryService;
