import MedicalEquipmentController from "../../../../src/controllers/medical-equipment.controller";
import MedicalEquipmentService from "../../../../src/services/medical-equipment.service";
import { Request, Response, NextFunction } from "express";

jest.mock("../../../../src/services/medical-equipment.service");

describe("MedicalEquipmentController - addMedicalEquipment", () => {
  let controller: MedicalEquipmentController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    controller = new MedicalEquipmentController();
    req = { body: {}, user: { userId: "123" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("should add medical equipment successfully", async () => {
    const mockEquipment = { id: "1", name: "Ventilator" };
    (
      MedicalEquipmentService.prototype.addMedicalEquipment as jest.Mock
    ).mockResolvedValue(mockEquipment);

    await controller.addMedicalEquipment(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: mockEquipment,
    });
  });

  it("should call next(error) on exception", async () => {
    (
      MedicalEquipmentService.prototype.addMedicalEquipment as jest.Mock
    ).mockRejectedValue(new Error("Failed"));

    await controller.addMedicalEquipment(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });
});
