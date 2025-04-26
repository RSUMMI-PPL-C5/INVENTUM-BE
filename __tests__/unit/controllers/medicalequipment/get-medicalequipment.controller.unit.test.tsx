import MedicalEquipmentController from "../../../../src/controllers/medicalequipment.controller";
import MedicalEquipmentService from "../../../../src/services/medicalequipment.service";
import { Request, Response, NextFunction } from "express";

jest.mock("../../../../src/services/medicalequipment.service");

describe("MedicalEquipmentController - getMedicalEquipment", () => {
  let controller: MedicalEquipmentController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    controller = new MedicalEquipmentController();
    req = { query: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("should get paginated medical equipment", async () => {
    const mockResult = { data: [{ id: "1", name: "Ventilator" }], total: 1 };
    (
      MedicalEquipmentService.prototype.getMedicalEquipment as jest.Mock
    ).mockResolvedValue(mockResult);

    await controller.getMedicalEquipment(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  it("should call next(error) on exception", async () => {
    (
      MedicalEquipmentService.prototype.getMedicalEquipment as jest.Mock
    ).mockRejectedValue(new Error("Failed"));

    await controller.getMedicalEquipment(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });
});

describe("MedicalEquipmentController - getMedicalEquipmentById", () => {
  let controller: MedicalEquipmentController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    controller = new MedicalEquipmentController();
    req = { params: { id: "1" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("should get medical equipment by id", async () => {
    const mockEquipment = { id: "1", name: "Ventilator" };
    (
      MedicalEquipmentService.prototype.getMedicalEquipmentById as jest.Mock
    ).mockResolvedValue(mockEquipment);

    await controller.getMedicalEquipmentById(
      req as Request,
      res as Response,
      next,
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: mockEquipment,
    });
  });

  it("should return 404 if equipment not found", async () => {
    (
      MedicalEquipmentService.prototype.getMedicalEquipmentById as jest.Mock
    ).mockResolvedValue(null);

    await controller.getMedicalEquipmentById(
      req as Request,
      res as Response,
      next,
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Medical Equipment not found",
    });
  });

  it("should call next(error) on exception", async () => {
    (
      MedicalEquipmentService.prototype.getMedicalEquipmentById as jest.Mock
    ).mockRejectedValue(new Error("Failed"));

    await controller.getMedicalEquipmentById(
      req as Request,
      res as Response,
      next,
    );

    expect(next).toHaveBeenCalled();
  });
});
