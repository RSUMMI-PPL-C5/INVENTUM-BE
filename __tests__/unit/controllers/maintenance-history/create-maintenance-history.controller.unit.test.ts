import MaintenanceHistoryController from "../../../../src/controllers/maintenance-history.controller";
import MaintenanceHistoryService from "../../../../src/services/maintenance-history.service";
import { Request, Response, NextFunction } from "express";

jest.mock("../../../../src/services/maintenance-history.service");

describe("MaintenanceHistoryController - createMaintenanceHistory", () => {
  let controller: MaintenanceHistoryController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    controller = new MaintenanceHistoryController();
    req = {
      params: { equipmentId: "123" },
      body: {
        maintenanceDate: "2025-04-28",
        technician: "John Doe",
        maintenanceType: "Preventive",
        description: "Regular maintenance",
        result: "Successful",
        nextMaintenanceDate: "2025-07-28",
      },
      user: { userId: "user123" },
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  // Positive case
  it("should create maintenance history successfully", async () => {
    const mockResult = {
      id: "maint123",
      medicalEquipmentId: "123",
      maintenanceDate: "2025-04-28",
      technician: "John Doe",
      maintenanceType: "Preventive",
      description: "Regular maintenance",
      result: "Successful",
      nextMaintenanceDate: "2025-07-28",
      createdBy: "user123",
      createdAt: new Date(),
    };

    (
      MaintenanceHistoryService.prototype.createMaintenanceHistory as jest.Mock
    ).mockResolvedValue(mockResult);

    await controller.createMaintenanceHistory(
      req as Request,
      res as Response,
      next,
    );

    expect(
      MaintenanceHistoryService.prototype.createMaintenanceHistory,
    ).toHaveBeenCalledWith({
      medicalEquipmentId: "123",
      maintenanceDate: "2025-04-28",
      technician: "John Doe",
      maintenanceType: "Preventive",
      description: "Regular maintenance",
      result: "Successful",
      nextMaintenanceDate: "2025-07-28",
      createdBy: "user123",
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: mockResult,
    });
  });

  // Negative case - service throws error
  it("should call next with error when service fails", async () => {
    const error = new Error("Database connection failed");
    (
      MaintenanceHistoryService.prototype.createMaintenanceHistory as jest.Mock
    ).mockRejectedValue(error);

    await controller.createMaintenanceHistory(
      req as Request,
      res as Response,
      next,
    );

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  // Edge case - undefined user
  it("should handle undefined user", async () => {
    req.user = undefined;

    await controller.createMaintenanceHistory(
      req as Request,
      res as Response,
      next,
    );

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  // Edge case - missing required fields
  it("should still pass request to service when some fields are missing", async () => {
    // Missing nextMaintenanceDate field
    req.body = {
      maintenanceDate: "2025-04-28",
      technician: "John Doe",
      maintenanceType: "Corrective",
      description: "Emergency repair",
      result: "Successful",
    };

    const mockResult = { id: "maint123", ...req.body };
    (
      MaintenanceHistoryService.prototype.createMaintenanceHistory as jest.Mock
    ).mockResolvedValue(mockResult);

    await controller.createMaintenanceHistory(
      req as Request,
      res as Response,
      next,
    );

    expect(
      MaintenanceHistoryService.prototype.createMaintenanceHistory,
    ).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
