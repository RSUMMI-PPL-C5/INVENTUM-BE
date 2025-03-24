import {
  AddMedicalEquipmentDTO,
  AddMedicalEquipmentResponseDTO,
} from "../../dto/medicalequipment.dto";

export interface IMedicalEquipmentService {
  addMedicalEquipment(
    data: AddMedicalEquipmentDTO,
  ): Promise<AddMedicalEquipmentResponseDTO>;
  findByInventorisId(
    inventorisId: string,
  ): Promise<AddMedicalEquipmentResponseDTO | null>;
}
