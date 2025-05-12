import MaintenanceHistoryController from "../../../../src/controllers/maintenance-history.controller";
import MaintenanceHistoryService from "../../../../src/services/maintenance-history.service";
import { Request, Response, NextFunction } from "express";

jest.mock("../../../../src/services/maintenance-history.service");

describe("MaintenanceHistoryController - getMaintenanceHistoriesByEquipmentId", () => {
  let controller: MaintenanceHistoryController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new MaintenanceHistoryController();
    req = {
      params: { equipmentId: "123" },
      query: {},
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  // Positive case - default pagination
  it("should get maintenance histories with default pagination", async () => {
    const mockResult = {
      data: [
        {
          id: "maint1",
          medicalEquipmentId: "123",
          maintenanceDate: "2025-04-28",
          technician: "John Doe",
        },
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };

    (
      MaintenanceHistoryService.prototype.getMaintenanceHistories as jest.Mock
    ).mockResolvedValue(mockResult);

    await controller.getMaintenanceHistoriesByEquipmentId(
      req as Request,
      res as Response,
      next,
    );

    expect(
      MaintenanceHistoryService.prototype.getMaintenanceHistories,
    ).toHaveBeenCalledWith(
      undefined, // search is undefined
      { medicalEquipmentId: "123" }, // Only equipment ID in filters
      { page: 1, limit: 10 },
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  // Positive case - with pagination parameters
  it("should get maintenance histories with specified pagination", async () => {
    req.query = { page: "2", limit: "5" };

    const mockResult = {
      data: [
        {
          id: "maint5",
          medicalEquipmentId: "123",
          maintenanceDate: "2025-03-15",
          technician: "Jane Smith",
        },
      ],
      meta: {
        total: 8,
        page: 2,
        limit: 5,
        totalPages: 2,
      },
    };

    (
      MaintenanceHistoryService.prototype.getMaintenanceHistories as jest.Mock
    ).mockResolvedValue(mockResult);

    await controller.getMaintenanceHistoriesByEquipmentId(
      req as Request,
      res as Response,
      next,
    );

    expect(
      MaintenanceHistoryService.prototype.getMaintenanceHistories,
    ).toHaveBeenCalledWith(
      undefined, // search is undefined
      {
        medicalEquipmentId: "123",
        page: "2",
        limit: "5",
      },
      { page: 2, limit: 5 },
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  // Positive case - with search parameter
  it("should get maintenance histories with search parameter", async () => {
    req.query = { search: "John" };

    const mockResult = {
      data: [
        {
          id: "maint1",
          medicalEquipmentId: "123",
          maintenanceDate: "2025-03-15",
          technician: "John Doe",
        },
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };

    (
      MaintenanceHistoryService.prototype.getMaintenanceHistories as jest.Mock
    ).mockResolvedValue(mockResult);

    await controller.getMaintenanceHistoriesByEquipmentId(
      req as Request,
      res as Response,
      next,
    );

    expect(
      MaintenanceHistoryService.prototype.getMaintenanceHistories,
    ).toHaveBeenCalledWith(
      "John", // search parameter
      {
        medicalEquipmentId: "123",
        search: "John",
      },
      { page: 1, limit: 10 },
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  // Positive case - with filters
  it("should get maintenance histories with filters", async () => {
    req.query = {
      result: "Success",
      maintenanceDateStart: "2025-01-01",
      maintenanceDateEnd: "2025-04-30",
    };

    const mockResult = {
      data: [
        {
          id: "maint1",
          medicalEquipmentId: "123",
          maintenanceDate: "2025-03-15",
          result: "Success",
        },
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };

    (
      MaintenanceHistoryService.prototype.getMaintenanceHistories as jest.Mock
    ).mockResolvedValue(mockResult);

    await controller.getMaintenanceHistoriesByEquipmentId(
      req as Request,
      res as Response,
      next,
    );

    expect(
      MaintenanceHistoryService.prototype.getMaintenanceHistories,
    ).toHaveBeenCalledWith(
      undefined, // search is undefined
      {
        medicalEquipmentId: "123",
        result: "Success",
        maintenanceDateStart: "2025-01-01",
        maintenanceDateEnd: "2025-04-30",
      },
      { page: 1, limit: 10 },
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  // Positive case - with createdOn date filters
  it("should get maintenance histories with createdOn date filters", async () => {
    req.query = {
      createdOnStart: "2025-01-01",
      createdOnEnd: "2025-04-30",
    };

    const mockResult = {
      data: [
        {
          id: "maint1",
          medicalEquipmentId: "123",
          maintenanceDate: "2025-03-15",
        },
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };

    (
      MaintenanceHistoryService.prototype.getMaintenanceHistories as jest.Mock
    ).mockResolvedValue(mockResult);

    await controller.getMaintenanceHistoriesByEquipmentId(
      req as Request,
      res as Response,
      next,
    );

    expect(
      MaintenanceHistoryService.prototype.getMaintenanceHistories,
    ).toHaveBeenCalledWith(
      undefined,
      {
        medicalEquipmentId: "123",
        createdOnStart: "2025-01-01",
        createdOnEnd: "2025-04-30",
      },
      { page: 1, limit: 10 },
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // Positive case - with all possible query parameters
  it("should handle all query parameters together", async () => {
    req.query = {
      search: "calibration",
      page: "2",
      limit: "5",
      result: "Success",
      maintenanceDateStart: "2025-01-01",
      maintenanceDateEnd: "2025-04-30",
      createdOnStart: "2025-01-01",
      createdOnEnd: "2025-04-30",
    };

    const mockResult = {
      data: [
        {
          id: "maint1",
          medicalEquipmentId: "123",
          maintenanceDate: "2025-03-15",
          result: "Success",
        },
      ],
      meta: {
        total: 8,
        page: 2,
        limit: 5,
        totalPages: 2,
      },
    };

    (
      MaintenanceHistoryService.prototype.getMaintenanceHistories as jest.Mock
    ).mockResolvedValue(mockResult);

    await controller.getMaintenanceHistoriesByEquipmentId(
      req as Request,
      res as Response,
      next,
    );

    expect(
      MaintenanceHistoryService.prototype.getMaintenanceHistories,
    ).toHaveBeenCalledWith(
      "calibration",
      {
        medicalEquipmentId: "123",
        search: "calibration",
        page: "2",
        limit: "5",
        result: "Success",
        maintenanceDateStart: "2025-01-01",
        maintenanceDateEnd: "2025-04-30",
        createdOnStart: "2025-01-01",
        createdOnEnd: "2025-04-30",
      },
      { page: 2, limit: 5 },
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  // Negative case - service throws error
  it("should call next with error when service fails", async () => {
    const error = new Error("Database query failed");
    (
      MaintenanceHistoryService.prototype.getMaintenanceHistories as jest.Mock
    ).mockRejectedValue(error);

    await controller.getMaintenanceHistoriesByEquipmentId(
      req as Request,
      res as Response,
      next,
    );

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  // Edge case - negative pagination values
  it("should handle negative pagination values", async () => {
    req.query = { page: "-1", limit: "-5" };

    const mockResult = {
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
    };

    (
      MaintenanceHistoryService.prototype.getMaintenanceHistories as jest.Mock
    ).mockResolvedValue(mockResult);

    await controller.getMaintenanceHistoriesByEquipmentId(
      req as Request,
      res as Response,
      next,
    );

    expect(
      MaintenanceHistoryService.prototype.getMaintenanceHistories,
    ).toHaveBeenCalledWith(
      undefined,
      {
        medicalEquipmentId: "123",
        page: "-1",
        limit: "-5",
      },
      { page: 1, limit: 10 }, // Should default to page 1 and limit 10
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // Edge case - non-numeric pagination values
  it("should handle non-numeric pagination values", async () => {
    req.query = { page: "abc", limit: "def" };

    await controller.getMaintenanceHistoriesByEquipmentId(
      req as Request,
      res as Response,
      next,
    );

    // NaN values from parseInt should be converted to defaults
    expect(
      MaintenanceHistoryService.prototype.getMaintenanceHistories,
    ).toHaveBeenCalledWith(
      undefined,
      {
        medicalEquipmentId: "123",
        page: "abc",
        limit: "def",
      },
      { page: 1, limit: 10 },
    );
  });

  // Edge case - empty search string
  it("should handle empty search string", async () => {
    req.query = { search: "" };

    await controller.getMaintenanceHistoriesByEquipmentId(
      req as Request,
      res as Response,
      next,
    );

    expect(
      MaintenanceHistoryService.prototype.getMaintenanceHistories,
    ).toHaveBeenCalledWith(
      "",
      {
        medicalEquipmentId: "123",
        search: "",
      },
      { page: 1, limit: 10 },
    );
  });
});
