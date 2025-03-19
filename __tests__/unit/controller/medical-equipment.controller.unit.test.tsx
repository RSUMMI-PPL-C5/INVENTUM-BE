import request from "supertest";
import express, { Application } from "express";
import MedicalEquipmentController from "../../../src/controllers/medical-equipment.controller";

const app = express();
app.use(express.json());

const mockService = {
    addMedicalEquipment: jest.fn(),
};

// Inisialisasi Controller dengan Mock Service
const controller = new MedicalEquipmentController();
(controller as any).medicalEquipmentService = mockService;

app.post("/medical-equipment", controller.addMedicalEquipment);

describe("MedicalEquipmentController - Add Medical Equipment", () => {

    // ✅ Positive Test: Berhasil menambahkan alat medis
    test("should add new medical equipment successfully", async () => {
        const mockRequestData = {
            name: "MRI Scanner",
            brand: "Philips",
            model: "M200",
            department: "Radiology",
            purchaseDate: "2024-01-01",
            vendor: "Philips Healthcare",
            price: 100000,
            createdBy: "admin123",
        };

        const mockResponseData = { id: "1", ...mockRequestData };

        mockService.addMedicalEquipment.mockResolvedValue(mockResponseData);

        const response = await request(app)
            .post("/medical-equipment")
            .send(mockRequestData);

        expect(response.status).toBe(201);
        expect(response.body).toEqual(mockResponseData);
        expect(mockService.addMedicalEquipment).toHaveBeenCalledWith(expect.objectContaining(mockRequestData));
    });

    // ❌ Negative Test: Menambahkan alat medis dengan request yang tidak valid (tanpa nama)
    test("should return 400 error for missing required fields", async () => {
        const invalidRequestData = {
            brand: "Philips",
            model: "M200",
            department: "Radiology",
            purchaseDate: "2024-01-01",
            vendor: "Philips Healthcare",
            price: 100000,
            createdBy: "admin123",
        };

        const response = await request(app)
            .post("/medical-equipment")
            .send(invalidRequestData);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("errors");
    });

    // ⚠️ Corner Case: Harga negatif harus gagal
    test("should return 400 error for negative price", async () => {
        const invalidRequestData = {
            name: "MRI Scanner",
            brand: "Philips",
            model: "M200",
            department: "Radiology",
            purchaseDate: "2024-01-01",
            vendor: "Philips Healthcare",
            price: -5000, // Harga negatif
            createdBy: "admin123",
        };

        const response = await request(app)
            .post("/medical-equipment")
            .send(invalidRequestData);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("errors");
    });
});
