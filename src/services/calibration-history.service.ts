import { ICalibrationHistoryService } from "./interface/calibration-history.service.interface";
import {
  CreateCalibrationHistoryDTO,
  CalibrationHistoryDTO,
} from "../dto/calibration-history.dto";
import { CalibrationHistoryFilterOptions } from "../interfaces/calibration-history.filter.interface";
import { PaginationOptions } from "../interfaces/pagination.interface";
import { v4 as uuidv4 } from "uuid";
import MedicalEquipmentRepository from "../repository/medical-equipment.repository";
import CalibrationHistoryRepository from "../repository/calibration-history.repository";

class CalibrationHistoryService implements ICalibrationHistoryService {
  private readonly calibrationHistoryRepository: CalibrationHistoryRepository;
  private readonly medicalEquipmentRepository: MedicalEquipmentRepository;

  constructor() {
    this.calibrationHistoryRepository = new CalibrationHistoryRepository();
    this.medicalEquipmentRepository = new MedicalEquipmentRepository();
  }

  public async createCalibrationHistory(
    calibrationData: CreateCalibrationHistoryDTO,
  ): Promise<CalibrationHistoryDTO> {
    const equipment =
      await this.medicalEquipmentRepository.getMedicalEquipmentById(
        calibrationData.medicalEquipmentId,
      );

    if (!equipment) {
      throw new Error(
        `Medical equipment with ID ${calibrationData.medicalEquipmentId} does not exist`,
      );
    }

    const calibrationHistoryId = uuidv4();

    return await this.calibrationHistoryRepository.createCalibrationHistory({
      id: calibrationHistoryId,
      ...calibrationData,
    });
  }

  public async getCalibrationHistories(
    search?: string,
    filters?: CalibrationHistoryFilterOptions,
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

    // Fetch calibration histories based on search, filters and pagination
    const { calibrationHistories, total } =
      await this.calibrationHistoryRepository.getCalibrationHistories(
        search,
        filters,
        pagination,
      );

    // Calculate total pages for pagination metadata
    const totalPages = pagination ? Math.ceil(total / pagination.limit) : 1;

    // Return formatted response with data and metadata
    return {
      data: calibrationHistories,
      meta: {
        total,
        page: pagination?.page ?? 1,
        limit: pagination?.limit ?? calibrationHistories.length,
        totalPages,
      },
    };
  }
}

export default CalibrationHistoryService;
