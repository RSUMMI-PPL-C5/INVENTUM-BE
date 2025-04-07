import express from "express";
import request from "supertest";
import MedicalEquipmentController from "../../../../src/controllers/medicalequipment.controller";

// Mock the controller before importing the router
jest.mock("../../../../src/controllers/medicalequipment.controller");

// Default mocks for all controller methods
const mockAddMedicalEquipment = jest.fn();
const mockUpdateMedicalEquipment = jest.fn();

// Set up default implementations
(MedicalEquipmentController as jest.Mock).mockImplementation(() => {
  return {
    addMedicalEquipment: mockAddMedicalEquipment,
    updateMedicalEquipment: mockUpdateMedicalEquipment,
  };
});

// Now import the router after the mocks are set up
import medicalEquipmentRouter from "../../../../src/routes/medicalequipment.route";

describe("Medical Equipment Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should export a router with required methods", () => {
    expect(medicalEquipmentRouter).toBeDefined();
    expect(medicalEquipmentRouter).toHaveProperty("get");
    expect(medicalEquipmentRouter).toHaveProperty("post");
    expect(medicalEquipmentRouter).toHaveProperty("put");
    expect(medicalEquipmentRouter).toHaveProperty("delete");
    expect(medicalEquipmentRouter).toHaveProperty("use");
    expect(medicalEquipmentRouter.name).toBe("router");
  });

  test("should handle PUT /:id and call updateMedicalEquipment", async () => {
    // Override the default mock for this test
    mockUpdateMedicalEquipment.mockImplementation((req, res) => {
      return res.status(200).json({ status: "success", message: "mocked" });
    });

    const app = express();
    app.use(express.json());
    app.use("/equipment", medicalEquipmentRouter);

    const dummyId = "equipment-id-123";
    const dummyPayload = {
      name: "Updated Name",
      brandName: "Updated Brand",
      modelName: "Updated Model",
      modifiedBy: 1,
    };

    const res = await request(app)
      .put(`/equipment/${dummyId}`)
      .send(dummyPayload);

    expect(mockUpdateMedicalEquipment).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
  });

  test("should handle errors in updateMedicalEquipment endpoint", async () => {
    const mockError = new Error("Test error");
    mockUpdateMedicalEquipment.mockRejectedValue(mockError);

    const app = express();
    app.use(express.json());
    app.use("/equipment", medicalEquipmentRouter);
    app.use(
      (
        err: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ) => {
        res.status(500).json({ error: err.message });
      },
    );

    const dummyId = "equipment-id-123";
    const dummyPayload = {
      name: "Updated Name",
    };

    const res = await request(app)
      .put(`/equipment/${dummyId}`)
      .send(dummyPayload);

    expect(mockUpdateMedicalEquipment).toHaveBeenCalled();
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Test error");
  });
});
