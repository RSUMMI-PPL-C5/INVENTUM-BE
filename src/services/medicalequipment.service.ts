import { IMedicalEquipmentService } from "./interface/medicalequipment.service.interface";
import {
  AddMedicalEquipmentDTO,
  AddMedicalEquipmentResponseDTO,
  UpdateMedicalEquipmentDTO,
} from "../dto/medicalequipment.dto";
import { v4 as uuidv4 } from "uuid";
import MedicalEquipmentRepository from "../repository/medicalequipment.repository";

class MedicalEquipmentService implements IMedicalEquipmentService {
  private readonly medicalEquipmentRepository: MedicalEquipmentRepository;

  constructor() {
    this.medicalEquipmentRepository = new MedicalEquipmentRepository();
  }

  public async addMedicalEquipment(
    equipmentData: AddMedicalEquipmentDTO,
  ): Promise<AddMedicalEquipmentResponseDTO> {
    // 🔥 Validasi inventorisId dulu sebelum cek lainnya
    if (
      !equipmentData.inventorisId ||
      typeof equipmentData.inventorisId !== "string" ||
      equipmentData.inventorisId.trim() === ""
    ) {
      throw new Error("inventorisId is required and must be a valid string");
    }

    // 🔥 Validasi name dan createdBy setelah inventorisId valid
    if (!equipmentData.name || typeof equipmentData.createdBy !== "number") {
      throw new Error(
        "name and createdBy are required, and createdBy must be a number",
      );
    }

    // Pastikan inventorisId unik sebelum menambahkan data
    const existingEquipment =
      await this.medicalEquipmentRepository.findByInventorisId(
        equipmentData.inventorisId,
      );
    if (existingEquipment) {
      throw new Error("Inventoris ID already in use");
    }

    const createData = {
      id: uuidv4(),
      ...equipmentData,
      createdOn: new Date(),
      modifiedOn: new Date(),
    };

    return await this.medicalEquipmentRepository.addMedicalEquipment(
      createData,
    );
  }

  public async findByInventorisId(
    inventorisId: string,
  ): Promise<AddMedicalEquipmentResponseDTO | null> {
    if (
      !inventorisId ||
      typeof inventorisId !== "string" ||
      inventorisId.trim() === ""
    ) {
      throw new Error("inventorisId is required and must be a valid string");
    }

    return await this.medicalEquipmentRepository.findByInventorisId(
      inventorisId,
    );
  }

  public async updateMedicalEquipment(
    id: string,
    equipmentData: UpdateMedicalEquipmentDTO,
  ): Promise<AddMedicalEquipmentResponseDTO | null> {
    // Validasi ID
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new Error("Equipment ID is required and must be a valid string");
    }

    // Validasi modifiedBy
    if (typeof equipmentData.modifiedBy !== "number") {
      throw new Error("modifiedBy is required and must be a number");
    }

    // Cek apakah equipment tersebut ada
    const equipment = await this.medicalEquipmentRepository.findById(id);
    if (!equipment) {
      throw new Error("Medical equipment not found");
    }

    // Siapkan data untuk update
    const updateData = {
      ...equipmentData,
      modifiedOn: new Date(),
    };

    // Proses update
    return await this.medicalEquipmentRepository.updateMedicalEquipment(
      id,
      updateData,
    );
  }
}

export default MedicalEquipmentService;
