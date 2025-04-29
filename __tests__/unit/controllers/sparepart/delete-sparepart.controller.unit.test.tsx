import SparepartController from "../../../../src/controllers/sparepart.controller";
import SparepartService from "../../../../src/services/sparepart.service";
import { Request, Response, NextFunction } from "express";

jest.mock("../../../../src/services/sparepart.service");

describe("SparepartController - deleteSparepart", () => {
  let controller: SparepartController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    controller = new SparepartController();
    req = { params: { id: "1" }, user: { userId: "123" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("should delete sparepart successfully", async () => {
    (SparepartService.prototype.deleteSparepart as jest.Mock).mockResolvedValue(
      true,
    );

    await controller.deleteSparepart(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Sparepart deleted successfully",
    });
  });

  it("should return 404 if sparepart not found", async () => {
    (SparepartService.prototype.deleteSparepart as jest.Mock).mockResolvedValue(
      false,
    );

    await controller.deleteSparepart(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Sparepart not found",
    });
  });

  it("should call next(error) on exception", async () => {
    (SparepartService.prototype.deleteSparepart as jest.Mock).mockRejectedValue(
      new Error("Failed"),
    );

    await controller.deleteSparepart(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });
});
