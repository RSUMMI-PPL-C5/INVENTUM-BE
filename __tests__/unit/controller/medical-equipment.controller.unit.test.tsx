import request from "supertest";
import express, { Application } from "express";
import MedicalEquipmentController from "../../../src/controllers/medical-equipment.controller";

const app: Application = express();
app.use(express.json());

const mockService = {
    addMedicalEquipment: jest.fn(),
};

// Inisialisasi Controller dengan Mock Service
const controller = new MedicalEquipmentController();
(controller as any).medicalEquipmentService = mockService;

app.post("/medical-equipment", controller.addMedicalEquipment);

describe("MedicalEquipmentController - Add Medical Equipment", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should add new medical equipment successfully", async () => {
        const mockRequestData = {
            name: "X-Ray Machine",
            brand: "Siemens",
            model: "XR-2000",
            department: "Radiology",
            purchaseDate: "2025-03-20T04:28:09.000Z",
            vendor: "Siemens Healthcare",
            price: 50000,
            createdBy: "admin123",
        };

        const mockResponseData = { id: 1, ...mockRequestData };
        mockService.addMedicalEquipment.mockResolvedValue(mockResponseData);

        const response = await request(app)
            .post("/medical-equipment")
            .send(mockRequestData);

        expect(response.status).toBe(201);
        expect(response.body).toEqual(mockResponseData);
        expect(mockService.addMedicalEquipment).toHaveBeenCalledWith(expect.objectContaining(mockRequestData));
    });

    test("should return 400 error for missing required fields", async () => {
        const invalidRequestData = {
            brand: "Siemens",
            model: "XR-2000",
            department: "Radiology",
            purchaseDate: "2025-03-20T04:28:09.000Z",
            vendor: "Siemens Healthcare",
            price: 50000,
            createdBy: "admin123",
        };

        const response = await request(app)
            .post("/medical-equipment")
            .send(invalidRequestData);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("errors");
    });

    test("should return 400 error for negative price", async () => {
        const invalidRequestData = {
            name: "X-Ray Machine",
            brand: "Siemens",
            model: "XR-2000",
            department: "Radiology",
            purchaseDate: "2025-03-20T04:28:09.000Z",
            vendor: "Siemens Healthcare",
            price: -5000,
            createdBy: "admin123",
        };

        const response = await request(app)
            .post("/medical-equipment")
            .send(invalidRequestData);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("errors");
    });
});