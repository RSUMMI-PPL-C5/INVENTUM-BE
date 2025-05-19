import { Request, Response } from "express";
import SparepartController from "../../../../src/controllers/sparepart.controller";
import SparepartService from "../../../../src/services/sparepart.service";
import AppError from "../../../../src/utils/appError";

jest.mock("../../../../src/services/sparepart.service");

describe("SparepartController", () => {
  let controller: SparepartController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    controller = new SparepartController();
    req = {
      body: {
        partsName: "Test Part",
        price: 100,
        toolLocation: "Location A",
        imageUrl: "assets/images/spareparts/test.jpg",
      },
      params: {
        id: "1",
      },
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("addSparepart", () => {
    it("should create sparepart successfully", async () => {
      const mockResult = {
        id: "1",
        ...req.body,
      };

      (SparepartService.prototype.addSparepart as jest.Mock).mockResolvedValue(
        mockResult,
      );

      await controller.addSparepart(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it("should handle AppError correctly", async () => {
      const appError = new AppError("Validation failed", 400);
      (SparepartService.prototype.addSparepart as jest.Mock).mockRejectedValue(
        appError,
      );

      await controller.addSparepart(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Validation failed" });
    });

    it("should handle generic error correctly", async () => {
      const error = new Error("Internal error");
      (SparepartService.prototype.addSparepart as jest.Mock).mockRejectedValue(
        error,
      );

      await controller.addSparepart(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });

  describe("updateSparepart", () => {
    it("should update sparepart successfully", async () => {
      const mockResult = {
        id: "1",
        ...req.body,
      };

      (
        SparepartService.prototype.updateSparepart as jest.Mock
      ).mockResolvedValue(mockResult);

      await controller.updateSparepart(req as Request, res as Response);

      expect(SparepartService.prototype.updateSparepart).toHaveBeenCalledWith(
        "1",
        req.body,
      );
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it("should handle AppError correctly", async () => {
      const appError = new AppError("Validation failed", 400);
      (
        SparepartService.prototype.updateSparepart as jest.Mock
      ).mockRejectedValue(appError);

      await controller.updateSparepart(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Validation failed" });
    });

    it("should handle generic error correctly", async () => {
      const error = new Error("Internal error");
      (
        SparepartService.prototype.updateSparepart as jest.Mock
      ).mockRejectedValue(error);

      await controller.updateSparepart(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });

  describe("getSpareparts", () => {
    it("should get spareparts with default pagination", async () => {
      const mockResult = {
        data: [{ id: "1", partsName: "Test Part" }],
        meta: { total: 1, page: 1, limit: 10 },
      };

      (SparepartService.prototype.getSpareparts as jest.Mock).mockResolvedValue(
        mockResult,
      );

      await controller.getSpareparts(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it("should handle error correctly", async () => {
      const error = new Error("Database error");
      (SparepartService.prototype.getSpareparts as jest.Mock).mockRejectedValue(
        error,
      );

      await controller.getSpareparts(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getSparepartById", () => {
    it("should get sparepart by id successfully", async () => {
      const mockSparepart = { id: "1", partsName: "Test Part" };
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

    it("should handle error correctly", async () => {
      const error = new Error("Database error");
      (
        SparepartService.prototype.getSparepartById as jest.Mock
      ).mockRejectedValue(error);

      await controller.getSparepartById(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("deleteSparepart", () => {
    beforeEach(() => {
      req.user = { userId: "user123" };
    });

    it("should delete sparepart successfully", async () => {
      (
        SparepartService.prototype.deleteSparepart as jest.Mock
      ).mockResolvedValue(true);

      await controller.deleteSparepart(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Sparepart deleted successfully",
      });
    });

    it("should return 404 if sparepart not found", async () => {
      (
        SparepartService.prototype.deleteSparepart as jest.Mock
      ).mockResolvedValue(false);

      await controller.deleteSparepart(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Sparepart not found",
      });
    });

    it("should handle error correctly", async () => {
      const error = new Error("Database error");
      (
        SparepartService.prototype.deleteSparepart as jest.Mock
      ).mockRejectedValue(error);

      await controller.deleteSparepart(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
