import MedicalEquipmentController from "../../../../src/controllers/medical-equipment.controller";
import MedicalEquipmentService from "../../../../src/services/medical-equipment.service";
import { Request, Response, NextFunction } from "express";

jest.mock("../../../../src/services/medical-equipment.service");

describe("MedicalEquipmentController - deleteMedicalEquipment", () => {
  let controller: MedicalEquipmentController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    controller = new MedicalEquipmentController();
    req = { params: { id: "1" }, user: { userId: "123" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("should delete medical equipment successfully", async () => {
    (
      MedicalEquipmentService.prototype.deleteMedicalEquipment as jest.Mock
    ).mockResolvedValue(true);

    await controller.deleteMedicalEquipment(
      req as Request,
      res as Response,
      next,
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Medical Equipment deleted successfully",
    });
  });

  it("should return 404 if equipment not found", async () => {
    (
      MedicalEquipmentService.prototype.deleteMedicalEquipment as jest.Mock
    ).mockResolvedValue(false);

    await controller.deleteMedicalEquipment(
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
      MedicalEquipmentService.prototype.deleteMedicalEquipment as jest.Mock
    ).mockRejectedValue(new Error("Failed"));

    await controller.deleteMedicalEquipment(
      req as Request,
      res as Response,
      next,
    );

    expect(next).toHaveBeenCalled();
  });
});
