import DivisionController from "../../../../src/controllers/division.controller";
import DivisionService from "../../../../src/services/division.service";
import { Request, Response, NextFunction } from "express";

jest.mock("../../../../src/services/division.service");

describe("DivisionController - addDivision", () => {
  let divisionController: DivisionController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    divisionController = new DivisionController();
    req = { body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("should return 400 if parentId is invalid", async () => {
    req.body = { parentId: "invalid" };

    await divisionController.addDivision(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Parent ID must be a number or null",
    });
  });

  it("should create division successfully", async () => {
    req.body = { divisi: "HR", parentId: null };
    const mockDivision = { id: 1, divisi: "HR", parentId: null };

    (DivisionService.prototype.addDivision as jest.Mock).mockResolvedValue(
      mockDivision,
    );

    await divisionController.addDivision(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockDivision);
  });

  it("should call next(error) on exception", async () => {
    (DivisionService.prototype.addDivision as jest.Mock).mockRejectedValue(
      new Error("Failed"),
    );

    await divisionController.addDivision(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });
});
