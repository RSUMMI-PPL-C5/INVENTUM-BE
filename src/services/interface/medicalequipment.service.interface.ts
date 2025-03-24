import { MedicalEquipment } from "@prisma/client";
import { MedicalEquipmentFilterOptions } from "../../filters/interface/medicalequipment.filter.interface";
import { MedicalEquipmentDTO } from "../../dto/medicalequipment.dto";


export interface IMedicalEquipmentService{
    getMedicalEquipment(): Promise<MedicalEquipmentDTO[]>;
    getMedicalEquipmentById(id: string): Promise<MedicalEquipmentDTO | null>;
    getFilteredMedicalEquipment(filters: MedicalEquipmentFilterOptions): Promise<MedicalEquipment[]>;
    searchMedicalEquipment(name: string): Promise<MedicalEquipment[]>;
}