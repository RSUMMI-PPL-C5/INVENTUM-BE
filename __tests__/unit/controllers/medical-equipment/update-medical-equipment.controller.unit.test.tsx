import MedicalEquipmentController from "../../../../src/controllers/medical-equipment.controller";
import MedicalEquipmentService from "../../../../src/services/medical-equipment.service";
import { Request, Response, NextFunction } from "express";

jest.mock("../../../../src/services/medical-equipment.service");

describe("MedicalEquipmentController - updateMedicalEquipment", () => {
  let controller: MedicalEquipmentController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    controller = new MedicalEquipmentController();
    req = { params: { id: "1" }, body: {}, user: { userId: "123" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("should update medical equipment successfully", async () => {
    const mockUpdatedEquipment = { id: "1", name: "Updated Ventilator" };
    (
      MedicalEquipmentService.prototype.updateMedicalEquipment as jest.Mock
    ).mockResolvedValue(mockUpdatedEquipment);

    await controller.updateMedicalEquipment(
      req as Request,
      res as Response,
      next,
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: mockUpdatedEquipment,
    });
  });

  it("should return 404 if equipment not found", async () => {
    (
      MedicalEquipmentService.prototype.updateMedicalEquipment as jest.Mock
    ).mockResolvedValue(null);

    await controller.updateMedicalEquipment(
      req as Request,
      res as Response,
      next,
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Medical equipment not found",
    });
  });

  it("should call next(error) on exception", async () => {
    (
      MedicalEquipmentService.prototype.updateMedicalEquipment as jest.Mock
    ).mockRejectedValue(new Error("Failed"));

    await controller.updateMedicalEquipment(
      req as Request,
      res as Response,
      next,
    );

    expect(next).toHaveBeenCalled();
  });
});
