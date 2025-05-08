import RequestController from "../../../../src/controllers/request.controller";
import RequestService from "../../../../src/services/request.service";
import { Request, Response, NextFunction } from "express";

jest.mock("../../../../src/services/request.service");

describe("RequestController", () => {
  let controller: RequestController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    controller = new RequestController();
    req = {
      body: {
        medicalEquipment: "EQ123",
        complaint: "Equipment not working properly",
        submissionDate: new Date().toISOString(),
      },
      user: { userId: "USER123" },
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  describe("createMaintenanceRequest", () => {
    it("should create maintenance request successfully", async () => {
      const mockRequest = {
        id: "REQ123",
        userId: "USER123",
        medicalEquipment: "EQ123",
        complaint: "Equipment not working properly",
        submissionDate: new Date(),
        status: "Pending",
        requestType: "MAINTENANCE",
      };

      // Mock the service to return the expected data structure
      (RequestService.prototype.createRequest as jest.Mock).mockResolvedValue({
        data: mockRequest,
      });

      await controller.createMaintenanceRequest(
        req as Request,
        res as Response,
        next,
      );

      expect(RequestService.prototype.createRequest).toHaveBeenCalledWith({
        ...req.body,
        userId: "USER123",
        createdBy: "USER123",
        requestType: "MAINTENANCE",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: mockRequest,
      });
    });

    it("should call next(error) on exception", async () => {
      (RequestService.prototype.createRequest as jest.Mock).mockRejectedValue(
        new Error("Failed to create maintenance request"),
      );

      await controller.createMaintenanceRequest(
        req as Request,
        res as Response,
        next,
      );

      expect(next).toHaveBeenCalled();
    });
  });

  describe("createCalibrationRequest", () => {
    it("should create calibration request successfully", async () => {
      const mockRequest = {
        id: "REQ123",
        userId: "USER123",
        medicalEquipment: "EQ123",
        complaint: "Equipment needs calibration",
        submissionDate: new Date(),
        status: "Pending",
        requestType: "CALIBRATION",
      };

      // Mock the service to return the expected data structure
      (RequestService.prototype.createRequest as jest.Mock).mockResolvedValue({
        data: mockRequest,
      });

      await controller.createCalibrationRequest(
        req as Request,
        res as Response,
        next,
      );

      expect(RequestService.prototype.createRequest).toHaveBeenCalledWith({
        ...req.body,
        userId: "USER123",
        createdBy: "USER123",
        requestType: "CALIBRATION",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: mockRequest,
      });
    });

    it("should call next(error) on exception", async () => {
      (RequestService.prototype.createRequest as jest.Mock).mockRejectedValue(
        new Error("Failed to create calibration request"),
      );

      await controller.createCalibrationRequest(
        req as Request,
        res as Response,
        next,
      );

      expect(next).toHaveBeenCalled();
    });
  });
});
