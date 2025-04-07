import {
  AddMedicalEquipmentDTO,
  AddMedicalEquipmentResponseDTO,
  UpdateMedicalEquipmentDTO,
} from "../../dto/medicalequipment.dto";

export interface IMedicalEquipmentService {
  addMedicalEquipment(
    data: AddMedicalEquipmentDTO,
  ): Promise<AddMedicalEquipmentResponseDTO>;

  findByInventorisId(
    inventorisId: string,
  ): Promise<AddMedicalEquipmentResponseDTO | null>;

  updateMedicalEquipment(
    id: string,
    equipmentData: UpdateMedicalEquipmentDTO,
  ): Promise<AddMedicalEquipmentResponseDTO | null>;
}
