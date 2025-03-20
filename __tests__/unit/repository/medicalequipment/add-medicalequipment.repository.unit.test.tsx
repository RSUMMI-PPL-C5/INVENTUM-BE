// First, set up the mock before importing the repository
import { PrismaClient } from "@prisma/client";
import { MedicalEquipmentDTO } from "../../../../src/dto/medicalequipment.dto";

const prisma = {
    medicalEquipment: {
        create: jest.fn(),
    },
} as unknown as PrismaClient;

// Mock the db.config module with the correct path
jest.mock("../../../src/configs/db.config", () => ({
    __esModule: true,
    default: prisma,
}));

// Now import the repository after setting up the mock
import MedicalEquipmentRepository from "../../../../src/repository/add-medicalequipment.repository";

describe("MedicalEquipmentRepository - createMedicalEquipment", () => {
    const mockEquipment: Omit<MedicalEquipmentDTO, "id"> = {
        inventorisId: "INV-2325",
        name: "X-Ray Machine",
        brandName: "Siemens",
        modelName: "XR-2000",
        purchaseDate: new Date(),
        purchasePrice: 1000000,
        status: "Baik",
        vendor: "Vendor A",
        createdBy: 1,
        createdOn: new Date(),
        modifiedBy: null,
        modifiedOn: null,
        deletedBy: null,
        deletedOn: null,
    };

    const repository = new MedicalEquipmentRepository();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Positive test case
    it("should create a medical equipment", async () => {
        const mockResult = { id: 1, ...mockEquipment };
        (prisma.medicalEquipment.create as jest.Mock).mockResolvedValue(mockResult);

        const result = await repository.createMedicalEquipment(mockEquipment);

        expect(result).toEqual(mockResult);
        expect(prisma.medicalEquipment.create).toHaveBeenCalledWith({
            data: {
                ...mockEquipment,
                purchaseDate: expect.any(Date),
                createdOn: expect.any(Date),
                modifiedOn: undefined,
                deletedOn: null,
            },
        });
    });

    // Negative test case
    it("should fail to create medical equipment with missing required field", async () => {
        const invalidData = { ...mockEquipment, inventorisId: "" }; // inventorisId kosong

        await expect(repository.createMedicalEquipment(invalidData)).rejects.toThrow(
            "inventorisId is required"
        );

        expect(prisma.medicalEquipment.create).not.toHaveBeenCalled();
    });

    // Corner test case
    it("should fail to create medical equipment with negative purchase price", async () => {
        const invalidData = { ...mockEquipment, purchasePrice: -5000 }; // Harga negatif

        await expect(repository.createMedicalEquipment(invalidData)).rejects.toThrow(
            "Purchase price cannot be negative"
        );

        expect(prisma.medicalEquipment.create).not.toHaveBeenCalled();
    });

    // Test zero purchase price instead of null
    it("should handle zero purchase price correctly", async () => {
        const dataWithZeroPrice = {
            ...mockEquipment,
            purchasePrice: 0
        };

        const mockResult = { id: 1, ...dataWithZeroPrice };
        (prisma.medicalEquipment.create as jest.Mock).mockResolvedValue(mockResult);

        const result = await repository.createMedicalEquipment(dataWithZeroPrice);

        expect(result).toEqual(mockResult);
        expect(prisma.medicalEquipment.create).toHaveBeenCalledWith({
            data: {
                ...dataWithZeroPrice,
                purchaseDate: expect.any(Date),
                createdOn: expect.any(Date),
                modifiedOn: undefined,
                deletedOn: null,
            },
        });
    });

    // Test handling of dates with minimum value instead of null
    it("should handle minimum value dates correctly", async () => {
        const minDate = new Date(0); // 1970-01-01T00:00:00.000Z
        const dataWithMinDates = {
            ...mockEquipment,
            purchaseDate: minDate,
            modifiedOn: null, // Set explicitly to null
            deletedOn: null,
        };

        const mockResult = { id: 1, ...dataWithMinDates };
        (prisma.medicalEquipment.create as jest.Mock).mockResolvedValue(mockResult);

        const result = await repository.createMedicalEquipment(dataWithMinDates);

        expect(result).toEqual(mockResult);
        expect(prisma.medicalEquipment.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                ...dataWithMinDates,
                purchaseDate: minDate,
                modifiedOn: undefined,
                deletedOn: null,
            }),
        });
    });
});