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

    jest.clearAllMocks();
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

  it("should create division successfully with explicit null parentId", async () => {
    req.body = { divisi: "HR", parentId: null };
    const mockDivision = { id: 1, divisi: "HR", parentId: null };

    (DivisionService.prototype.addDivision as jest.Mock).mockResolvedValue(
      mockDivision,
    );

    await divisionController.addDivision(req as Request, res as Response, next);

    expect(DivisionService.prototype.addDivision).toHaveBeenCalledWith({
      divisi: "HR",
      parentId: null,
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockDivision);
  });

  it("should create division with null parentId when parentId is undefined", async () => {
    req.body = { divisi: "Finance" };
    const mockDivision = { id: 2, divisi: "Finance", parentId: null };

    (DivisionService.prototype.addDivision as jest.Mock).mockResolvedValue(
      mockDivision,
    );

    await divisionController.addDivision(req as Request, res as Response, next);

    expect(DivisionService.prototype.addDivision).toHaveBeenCalledWith({
      divisi: "Finance",
      parentId: null,
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockDivision);
  });

  it("should create division with numeric parentId when parentId is a number", async () => {
    req.body = { divisi: "IT", parentId: 1 };
    const mockDivision = { id: 3, divisi: "IT", parentId: 1 };

    (DivisionService.prototype.addDivision as jest.Mock).mockResolvedValue(
      mockDivision,
    );

    await divisionController.addDivision(req as Request, res as Response, next);

    expect(DivisionService.prototype.addDivision).toHaveBeenCalledWith({
      divisi: "IT",
      parentId: 1,
    });
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
