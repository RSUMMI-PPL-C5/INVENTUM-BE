import { PrismaClient } from "@prisma/client";
import { MedicalEquipmentRepository } from "../../../../src/repository/add-medicalequipment.repository";
import { AddMedicalEquipmentDTO } from "../../../../src/dto/medicalequipment.dto";

jest.mock("@prisma/client", () => {
    const actualPrisma = jest.requireActual("@prisma/client");
    return {
        ...actualPrisma,
        PrismaClient: jest.fn().mockImplementation(() => ({
            medicalEquipment: {
                create: jest.fn(),
            },
        })),
    };
});

const prisma = new PrismaClient();
const mockCreate = prisma.medicalEquipment.create as jest.Mock;

mockCreate.mockImplementation(async (inputData) => ({
    id: crypto.randomUUID(),
    ...inputData.data,
    createdOn: new Date(),
    modifiedOn: new Date(),
    deletedBy: null,
    deletedOn: null,
}));

const repository = new MedicalEquipmentRepository();


describe("MedicalEquipmentRepository - createMedicalEquipment", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    // ✅ Positive Test Case - Data valid harus sukses
    it("should create a new medical equipment successfully", async () => {
        const inputData: AddMedicalEquipmentDTO = {
            inventorisId: "INV-12345",
            name: "X-Ray Machine",
            brandName: "Siemens",
            modelName: "X2000",
            purchaseDate: new Date("2024-01-01"),
            purchasePrice: 50000000,
            status: "Active",
            vendor: "MediTech Supplies",
            createdBy: 1,
        };

        const expectedOutput = {
            id: 1,
            ...inputData,
            createdOn: new Date(),
            modifiedOn: new Date(),
            deletedBy: null,
            deletedOn: null,
        };

        mockCreate.mockResolvedValue(expectedOutput);

        const result = await repository.createMedicalEquipment(inputData);
        expect(result).toEqual({
            id: 1,
            inventorisId: "INV-12345",
            name: "X-Ray Machine",
            brand: "Siemens",
            model: "X2000",
        });
        expect(mockCreate).toHaveBeenCalledWith({
            data: expect.objectContaining({
                ...inputData,
                createdOn: expect.any(Date),
                modifiedOn: expect.any(Date),
            }),
        });
    });

    // ❌ Negative Test Case - Gagal karena inventorisId duplikat
    it("should fail to create medical equipment due to duplicate inventorisId", async () => {
        const inputData: AddMedicalEquipmentDTO = {
            inventorisId: "INV-12345",
            name: "X-Ray Machine",
            brandName: "Siemens",
            modelName: "X2000",
            purchaseDate: new Date("2024-01-01"),
            purchasePrice: 50000000,
            status: "Active",
            vendor: "MediTech Supplies",
            createdBy: 1,
        };

        mockCreate.mockRejectedValue(
            new Error("Unique constraint failed on the fields: (`inventorisId`)")
        );

        await expect(repository.createMedicalEquipment(inputData)).rejects.toThrow(
            "Unique constraint failed on the fields: (`inventorisId`)"
        );
    });

    // 🚧 Corner Case Test - Tidak mengisi field opsional
    it("should create medical equipment with only required fields", async () => {
        const inputData: AddMedicalEquipmentDTO = {
            inventorisId: "INV-67890",
            name: "MRI Scanner",
            createdBy: 2,
        };

        const expectedOutput = {
            id: 2,
            inventorisId: "INV-67890",
            name: "MRI Scanner",
            brandName: null,
            modelName: null,
            purchaseDate: null,
            purchasePrice: null,
            status: "Active",
            vendor: null,
            createdBy: 2,
            createdOn: new Date(),
            modifiedOn: new Date(),
            deletedBy: null,
            deletedOn: null,
        };

        mockCreate.mockResolvedValue(expectedOutput);

        const result = await repository.createMedicalEquipment(inputData);
        expect(result).toEqual({
            id: 2,
            inventorisId: "INV-67890",
            name: "MRI Scanner",
            brand: "",
            model: "",
        });
    });

    // 🚧 Corner Case Test - Nilai field dengan batasan data
    it("should handle maximum string length for name", async () => {
        const longName = "A".repeat(255);
        const inputData: AddMedicalEquipmentDTO = {
            inventorisId: "INV-99999",
            name: longName,
            createdBy: 3,
        };

        const expectedOutput = {
            id: 3,
            inventorisId: "INV-99999",
            name: longName,
            brandName: null,
            modelName: null,
            purchaseDate: null,
            purchasePrice: null,
            status: "Active",
            vendor: null,
            createdBy: 3,
            createdOn: new Date(),
            modifiedOn: new Date(),
            deletedBy: null,
            deletedOn: null,
        };

        mockCreate.mockResolvedValue(expectedOutput);

        const result = await repository.createMedicalEquipment(inputData);
        expect(result).toEqual({
            id: 3,
            inventorisId: "INV-99999",
            name: longName,
            brand: "",
            model: "",
        });
    });

    // ❌ Negative Test Case - purchasePrice negatif
    it("should fail when purchasePrice is negative", async () => {
        const inputData: AddMedicalEquipmentDTO = {
            inventorisId: "INV-54321",
            name: "Ultrasound Machine",
            purchasePrice: -1000000,
            createdBy: 4,
        };

        await expect(repository.createMedicalEquipment(inputData)).rejects.toThrow(
            "purchasePrice must be a positive number"
        );
    });

    // ❌ Negative Test Case - inventorisId kosong
    it("should fail when inventorisId is empty", async () => {
        const inputData: AddMedicalEquipmentDTO = {
            inventorisId: "",
            name: "Defibrillator",
            createdBy: 5,
        };

        await expect(repository.createMedicalEquipment(inputData)).rejects.toThrow(
            "inventorisId cannot be empty"
        );
    });
});