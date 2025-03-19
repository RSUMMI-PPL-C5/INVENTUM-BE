import { PrismaClient } from "@prisma/client";
import { MedicalEquipmentDTO } from "../dto/medical-equipment.dto";

import prisma from "../configs/db.config";

class MedicalEquipmentRepository {
    private readonly prisma: PrismaClient;

    constructor() {
        this.prisma = prisma;
    }

    public async createMedicalEquipment(
        data: Omit<MedicalEquipmentDTO, "id">
    ): Promise<MedicalEquipmentDTO> {
        // Validasi data sebelum menyimpan ke database
        if (!data.inventorisId || data.inventorisId.trim() === "") {
            throw new Error("inventorisId is required");
        }
        if (data.purchasePrice !== null && data.purchasePrice < 0) {
            throw new Error("Purchase price cannot be negative");
        }

        const newEquipment = await this.prisma.medicalEquipment.create({
            data: {
                ...data,
                purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
                createdOn: new Date(data.createdOn),
                modifiedOn: data.modifiedOn ? new Date(data.modifiedOn) : undefined,
                deletedOn: data.deletedOn ? new Date(data.deletedOn) : null,
            },
        });

        return newEquipment as MedicalEquipmentDTO;
    }
}

export default MedicalEquipmentRepository;