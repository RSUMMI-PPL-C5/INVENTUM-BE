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

  it("should use default pagination values when no query params provided", async () => {
    req.query = {};
    const mockResult = { data: [], total: 0 };
    (SparepartService.prototype.getSpareparts as jest.Mock).mockResolvedValue(
      mockResult,
    );

    await controller.getSpareparts(req as Request, res as Response, next);

    expect(SparepartService.prototype.getSpareparts).toHaveBeenCalledWith(
      undefined,
      {},
      { page: 1, limit: 10 },
    );
  });

  it("should use provided pagination values", async () => {
    req.query = { page: "2", limit: "20" };
    const mockResult = { data: [], total: 0 };
    (SparepartService.prototype.getSpareparts as jest.Mock).mockResolvedValue(
      mockResult,
    );

    await controller.getSpareparts(req as Request, res as Response, next);

    expect(SparepartService.prototype.getSpareparts).toHaveBeenCalledWith(
      undefined,
      { page: "2", limit: "20" },
      { page: 2, limit: 20 },
    );
  });

  it("should use fallback values for negative pagination params", async () => {
    req.query = { page: "-1", limit: "-5" };
    const mockResult = { data: [], total: 0 };
    (SparepartService.prototype.getSpareparts as jest.Mock).mockResolvedValue(
      mockResult,
    );

    await controller.getSpareparts(req as Request, res as Response, next);

    expect(SparepartService.prototype.getSpareparts).toHaveBeenCalledWith(
      undefined,
      { page: "-1", limit: "-5" },
      { page: 1, limit: 10 },
    );
  });

  it("should use default values for non-numeric pagination params", async () => {
    req.query = { page: "abc", limit: "xyz" };
    const mockResult = { data: [], total: 0 };
    (SparepartService.prototype.getSpareparts as jest.Mock).mockResolvedValue(
      mockResult,
    );

    await controller.getSpareparts(req as Request, res as Response, next);

    expect(SparepartService.prototype.getSpareparts).toHaveBeenCalledWith(
      undefined,
      { page: "abc", limit: "xyz" },
      { page: 1, limit: 10 },
    );
  });

  it("should pass search parameter to service", async () => {
    req.query = { search: "motor" };
    const mockResult = { data: [], total: 0 };
    (SparepartService.prototype.getSpareparts as jest.Mock).mockResolvedValue(
      mockResult,
    );

    await controller.getSpareparts(req as Request, res as Response, next);

    expect(SparepartService.prototype.getSpareparts).toHaveBeenCalledWith(
      "motor", // search term
      { search: "motor" },
      { page: 1, limit: 10 },
    );
  });

  it("should pass filter parameters to service", async () => {
    req.query = { category: "electronics", status: "available" };
    const mockResult = { data: [], total: 0 };
    (SparepartService.prototype.getSpareparts as jest.Mock).mockResolvedValue(
      mockResult,
    );

    await controller.getSpareparts(req as Request, res as Response, next);

    expect(SparepartService.prototype.getSpareparts).toHaveBeenCalledWith(
      undefined,
      { category: "electronics", status: "available" },
      { page: 1, limit: 10 },
    );
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
