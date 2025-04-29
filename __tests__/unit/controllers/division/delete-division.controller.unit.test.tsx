import DivisionController from "../../../../src/controllers/division.controller";
import DivisionService from "../../../../src/services/division.service";
import { Request, Response, NextFunction } from "express";

jest.mock("../../../../src/services/division.service");

describe("DivisionController - deleteDivision", () => {
  let divisionController: DivisionController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    divisionController = new DivisionController();
    req = { params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("should return 400 if id is invalid", async () => {
    req.params = { id: "invalid" };

    await divisionController.deleteDivision(
      req as Request,
      res as Response,
      next,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Invalid division ID",
    });
  });

  it("should return 404 if division not found", async () => {
    req.params = { id: "1" };

    (DivisionService.prototype.deleteDivision as jest.Mock).mockResolvedValue(
      false,
    );

    await divisionController.deleteDivision(
      req as Request,
      res as Response,
      next,
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Division not found",
    });
  });

  it("should delete division successfully", async () => {
    req.params = { id: "1" };

    (DivisionService.prototype.deleteDivision as jest.Mock).mockResolvedValue(
      true,
    );

    await divisionController.deleteDivision(
      req as Request,
      res as Response,
      next,
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Division deleted successfully",
    });
  });

  it("should call next(error) on exception", async () => {
    req.params = { id: "1" };
    const error = new Error("Failed");

    (DivisionService.prototype.deleteDivision as jest.Mock).mockRejectedValue(
      error,
    );

    await divisionController.deleteDivision(
      req as Request,
      res as Response,
      next,
    );

    expect(next).toHaveBeenCalledWith(error);
  });
});
