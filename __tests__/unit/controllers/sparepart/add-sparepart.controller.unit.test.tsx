import SparepartController from "../../../../src/controllers/sparepart.controller";
import SparepartService from "../../../../src/services/sparepart.service";
import { Request, Response, NextFunction } from "express";

jest.mock("../../../../src/services/sparepart.service");

describe("SparepartController - addSparepart", () => {
  let controller: SparepartController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    controller = new SparepartController();
    req = { body: {}, user: { userId: "123" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("should add sparepart successfully", async () => {
    const mockSparepart = { id: "1", name: "Gear" };
    (SparepartService.prototype.addSparepart as jest.Mock).mockResolvedValue(
      mockSparepart,
    );

    await controller.addSparepart(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: mockSparepart,
    });
  });

  it("should call next(error) on exception", async () => {
    (SparepartService.prototype.addSparepart as jest.Mock).mockRejectedValue(
      new Error("Failed"),
    );

    await controller.addSparepart(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });
});
