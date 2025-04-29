import DivisionController from "../../../../src/controllers/division.controller";
import DivisionService from "../../../../src/services/division.service";
import { Request, Response, NextFunction } from "express";

jest.mock("../../../../src/services/division.service");

describe("DivisionController - getDivisions", () => {
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

  describe("getDivisionsTree", () => {
    it("should return divisions hierarchy", async () => {
      const mockData = [{ id: 1, divisi: "HR", children: [] }];
      (
        DivisionService.prototype.getDivisionsHierarchy as jest.Mock
      ).mockResolvedValue(mockData);

      await divisionController.getDivisionsTree(
        req as Request,
        res as Response,
        next,
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it("should call next(error) on exception", async () => {
      (
        DivisionService.prototype.getDivisionsHierarchy as jest.Mock
      ).mockRejectedValue(new Error("Failed"));

      await divisionController.getDivisionsTree(
        req as Request,
        res as Response,
        next,
      );

      expect(next).toHaveBeenCalled();
    });
  });

  describe("getAllDivisions", () => {
    it("should return all divisions", async () => {
      const mockData = [{ id: 1, divisi: "HR" }];
      (
        DivisionService.prototype.getAllDivisions as jest.Mock
      ).mockResolvedValue(mockData);

      await divisionController.getAllDivisions(
        req as Request,
        res as Response,
        next,
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it("should call next(error) on exception", async () => {
      (
        DivisionService.prototype.getAllDivisions as jest.Mock
      ).mockRejectedValue(new Error("Failed"));

      await divisionController.getAllDivisions(
        req as Request,
        res as Response,
        next,
      );

      expect(next).toHaveBeenCalled();
    });
  });

  describe("getDivisionsWithUserCount", () => {
    it("should return divisions with user count", async () => {
      const mockData = [{ id: 1, divisi: "HR", userCount: 10 }];
      (
        DivisionService.prototype.getDivisionsWithUserCount as jest.Mock
      ).mockResolvedValue(mockData);

      await divisionController.getDivisionsWithUserCount(
        req as Request,
        res as Response,
        next,
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it("should call next(error) on exception", async () => {
      (
        DivisionService.prototype.getDivisionsWithUserCount as jest.Mock
      ).mockRejectedValue(new Error("Failed"));

      await divisionController.getDivisionsWithUserCount(
        req as Request,
        res as Response,
        next,
      );

      expect(next).toHaveBeenCalled();
    });
  });

  describe("getDivisionById", () => {
    it("should return 400 if id is invalid", async () => {
      req.params = { id: "invalid" };

      await divisionController.getDivisionById(
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

      (
        DivisionService.prototype.getDivisionById as jest.Mock
      ).mockResolvedValue(null);

      await divisionController.getDivisionById(
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

    it("should return division data", async () => {
      req.params = { id: "1" };
      const mockDivision = { id: 1, divisi: "HR" };

      (
        DivisionService.prototype.getDivisionById as jest.Mock
      ).mockResolvedValue(mockDivision);

      await divisionController.getDivisionById(
        req as Request,
        res as Response,
        next,
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockDivision);
    });

    it("should call next(error) on exception", async () => {
      req.params = { id: "1" };
      const error = new Error("Failed");

      (
        DivisionService.prototype.getDivisionById as jest.Mock
      ).mockRejectedValue(error);

      await divisionController.getDivisionById(
        req as Request,
        res as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
