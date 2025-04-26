import SparepartController from "../../../../src/controllers/sparepart.controller";
import SparepartService from "../../../../src/services/sparepart.service";
import { Request, Response, NextFunction } from "express";

jest.mock("../../../../src/services/sparepart.service");

describe("SparepartController - getSpareparts", () => {
  let controller: SparepartController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    controller = new SparepartController();
    req = { query: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("should get spareparts successfully", async () => {
    const mockResult = { data: [{ id: "1", name: "Gear" }], total: 1 };
    (SparepartService.prototype.getSpareparts as jest.Mock).mockResolvedValue(
      mockResult,
    );

    await controller.getSpareparts(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  it("should call next(error) on exception", async () => {
    (SparepartService.prototype.getSpareparts as jest.Mock).mockRejectedValue(
      new Error("Failed"),
    );

    await controller.getSpareparts(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });
});

describe("SparepartController - getSparepartById", () => {
  let controller: SparepartController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    controller = new SparepartController();
    req = { params: { id: "1" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("should get sparepart by id successfully", async () => {
    const mockSparepart = { id: "1", name: "Gear" };
    (
      SparepartService.prototype.getSparepartById as jest.Mock
    ).mockResolvedValue(mockSparepart);

    await controller.getSparepartById(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: mockSparepart,
    });
  });

  it("should return 404 if sparepart not found", async () => {
    (
      SparepartService.prototype.getSparepartById as jest.Mock
    ).mockResolvedValue(null);

    await controller.getSparepartById(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Sparepart not found",
    });
  });

  it("should call next(error) on exception", async () => {
    (
      SparepartService.prototype.getSparepartById as jest.Mock
    ).mockRejectedValue(new Error("Failed"));

    await controller.getSparepartById(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });
});
