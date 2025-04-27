import DivisionController from "../../../../src/controllers/division.controller";
import DivisionService from "../../../../src/services/division.service";
import { Request, Response, NextFunction } from "express";

jest.mock("../../../../src/services/division.service");

describe("DivisionController - updateDivision", () => {
  let divisionController: DivisionController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    divisionController = new DivisionController();
    req = { params: {}, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("should return 400 if id is invalid", async () => {
    req.params = { id: "invalid" };

    await divisionController.updateDivision(
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

  it("should return 400 if no update data provided", async () => {
    req.params = { id: "1" };
    req.body = {};

    await divisionController.updateDivision(
      req as Request,
      res as Response,
      next,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "No update data provided",
    });
  });

  it("should return 400 if parentId is invalid", async () => {
    req.params = { id: "1" };
    req.body = { parentId: "invalid" };

    await divisionController.updateDivision(
      req as Request,
      res as Response,
      next,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Invalid parent ID",
    });
  });

  it("should update division successfully", async () => {
    req.params = { id: "1" };
    req.body = { divisi: "Finance", parentId: null };
    const mockDivision = { id: 1, divisi: "Finance", parentId: null };

    (DivisionService.prototype.updateDivision as jest.Mock).mockResolvedValue(
      mockDivision,
    );

    await divisionController.updateDivision(
      req as Request,
      res as Response,
      next,
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Division updated successfully",
      division: mockDivision,
    });
  });

  it("should call next(error) on exception", async () => {
    req.params = { id: "1" };
    req.body = { divisi: "Finance" };

    const error = new Error("Failed");
    (DivisionService.prototype.updateDivision as jest.Mock).mockRejectedValue(
      error,
    );

    await divisionController.updateDivision(
      req as Request,
      res as Response,
      next,
    );

    expect(next).toHaveBeenCalledWith(error);
  });
});
