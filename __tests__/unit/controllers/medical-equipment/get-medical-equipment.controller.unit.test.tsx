import MedicalEquipmentController from "../../../../src/controllers/medical-equipment.controller";
import MedicalEquipmentService from "../../../../src/services/medical-equipment.service";
import { Request, Response, NextFunction } from "express";

jest.mock("../../../../src/services/medical-equipment.service");

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
    jest.clearAllMocks();
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

  it("should use default pagination values when no query params provided", async () => {
    req.query = {};
    const mockResult = { data: [], total: 0 };
    (
      MedicalEquipmentService.prototype.getMedicalEquipment as jest.Mock
    ).mockResolvedValue(mockResult);

    await controller.getMedicalEquipment(req as Request, res as Response, next);

    expect(
      MedicalEquipmentService.prototype.getMedicalEquipment,
    ).toHaveBeenCalledWith(undefined, {}, { page: 1, limit: 10 });
  });

  it("should use provided pagination values", async () => {
    req.query = { page: "2", limit: "20" };
    const mockResult = { data: [], total: 0 };
    (
      MedicalEquipmentService.prototype.getMedicalEquipment as jest.Mock
    ).mockResolvedValue(mockResult);

    await controller.getMedicalEquipment(req as Request, res as Response, next);

    expect(
      MedicalEquipmentService.prototype.getMedicalEquipment,
    ).toHaveBeenCalledWith(
      undefined,
      { page: "2", limit: "20" },
      { page: 2, limit: 20 },
    );
  });

  it("should use fallback values for negative pagination params", async () => {
    req.query = { page: "-1", limit: "-5" };
    const mockResult = { data: [], total: 0 };
    (
      MedicalEquipmentService.prototype.getMedicalEquipment as jest.Mock
    ).mockResolvedValue(mockResult);

    await controller.getMedicalEquipment(req as Request, res as Response, next);

    expect(
      MedicalEquipmentService.prototype.getMedicalEquipment,
    ).toHaveBeenCalledWith(
      undefined,
      { page: "-1", limit: "-5" },
      { page: 1, limit: 10 },
    );
  });

  it("should use default values for non-numeric pagination params", async () => {
    req.query = { page: "abc", limit: "xyz" };
    const mockResult = { data: [], total: 0 };
    (
      MedicalEquipmentService.prototype.getMedicalEquipment as jest.Mock
    ).mockResolvedValue(mockResult);

    await controller.getMedicalEquipment(req as Request, res as Response, next);

    expect(
      MedicalEquipmentService.prototype.getMedicalEquipment,
    ).toHaveBeenCalledWith(
      undefined,
      { page: "abc", limit: "xyz" },
      { page: 1, limit: 10 },
    );
  });

  it("should pass search parameter to service", async () => {
    req.query = { search: "ventilator" };
    const mockResult = { data: [], total: 0 };
    (
      MedicalEquipmentService.prototype.getMedicalEquipment as jest.Mock
    ).mockResolvedValue(mockResult);

    await controller.getMedicalEquipment(req as Request, res as Response, next);

    expect(
      MedicalEquipmentService.prototype.getMedicalEquipment,
    ).toHaveBeenCalledWith(
      "ventilator",
      { search: "ventilator" },
      { page: 1, limit: 10 },
    );
  });

  it("should pass filter parameters to service", async () => {
    req.query = { category: "respiratory", status: "available" };
    const mockResult = { data: [], total: 0 };
    (
      MedicalEquipmentService.prototype.getMedicalEquipment as jest.Mock
    ).mockResolvedValue(mockResult);

    await controller.getMedicalEquipment(req as Request, res as Response, next);

    expect(
      MedicalEquipmentService.prototype.getMedicalEquipment,
    ).toHaveBeenCalledWith(
      undefined,
      { category: "respiratory", status: "available" },
      { page: 1, limit: 10 },
    );
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
