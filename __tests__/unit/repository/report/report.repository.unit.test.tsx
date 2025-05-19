import ReportRepository from "../../../../src/repository/report.repository";
import {
  PlanReportFilterOptions,
  ResultReportFilterOptions,
  SummaryReportFilterOptions,
} from "../../../../src/interfaces/report.interface";
import { PaginationOptions } from "../../../../src/interfaces/pagination.interface";
import prisma from "../../../../src/configs/db.config";

// Mock the prisma module
jest.mock("../../../../src/configs/db.config", () => {
  const mockPrisma = {
    request: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    maintenanceHistory: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    calibrationHistory: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    partsHistory: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    comment: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };
  return mockPrisma;
});

// Import the mocked prisma instance

describe("ReportRepository - getPlanReports", () => {
  let reportRepository: ReportRepository;
  const mockPlans = [
    {
      id: "1",
      medicalEquipment: "equipment-1",
      requestType: "MAINTENANCE",
      status: "SCHEDULED",
      createdOn: new Date("2023-01-15"),
      user: { id: "user1", name: "John Doe" },
    },
    {
      id: "2",
      medicalEquipment: "equipment-2",
      requestType: "CALIBRATION",
      status: "PENDING",
      createdOn: new Date("2023-01-20"),
      user: { id: "user2", name: "Jane Smith" },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    reportRepository = new ReportRepository();

    // Default successful responses
    (prisma.request.findMany as jest.Mock).mockResolvedValue(mockPlans);
    (prisma.request.count as jest.Mock).mockResolvedValue(mockPlans.length);
  });

  it("should get plans with no filters or pagination", async () => {
    const result = await reportRepository.getPlanReports();

    expect(prisma.request.findMany).toHaveBeenCalledWith({
      where: {},
      skip: undefined,
      take: undefined,
      orderBy: { createdOn: "desc" },
      include: { user: true },
    });

    expect(prisma.request.count).toHaveBeenCalledWith({ where: {} });
    expect(result).toEqual({ plans: mockPlans, total: mockPlans.length });
  });

  it("should apply search filter correctly", async () => {
    const filters: PlanReportFilterOptions = { search: "equipment" };

    await reportRepository.getPlanReports(filters);

    expect(prisma.request.findMany).toHaveBeenCalledWith({
      where: { OR: [{ medicalEquipment: { contains: "equipment" } }] },
      skip: undefined,
      take: undefined,
      orderBy: { createdOn: "desc" },
      include: { user: true },
    });
  });

  it("should apply request type filter correctly", async () => {
    const filters: PlanReportFilterOptions = { type: "MAINTENANCE" };

    await reportRepository.getPlanReports(filters);

    expect(prisma.request.findMany).toHaveBeenCalledWith({
      where: { requestType: "MAINTENANCE" },
      skip: undefined,
      take: undefined,
      orderBy: { createdOn: "desc" },
      include: { user: true },
    });
  });

  it("should not apply type filter when type is 'all'", async () => {
    const filters: PlanReportFilterOptions = { type: "all" };

    await reportRepository.getPlanReports(filters);

    expect(prisma.request.findMany).toHaveBeenCalledWith({
      where: {},
      skip: undefined,
      take: undefined,
      orderBy: { createdOn: "desc" },
      include: { user: true },
    });
  });

  it("should apply scheduled status filter correctly", async () => {
    const filters: PlanReportFilterOptions = { status: "scheduled" };

    await reportRepository.getPlanReports(filters);

    expect(prisma.request.findMany).toHaveBeenCalledWith({
      where: { status: "SCHEDULED" },
      skip: undefined,
      take: undefined,
      orderBy: { createdOn: "desc" },
      include: { user: true },
    });
  });

  it("should apply pending status filter correctly", async () => {
    const filters: PlanReportFilterOptions = { status: "pending" };

    await reportRepository.getPlanReports(filters);

    expect(prisma.request.findMany).toHaveBeenCalledWith({
      where: { status: "PENDING" },
      skip: undefined,
      take: undefined,
      orderBy: { createdOn: "desc" },
      include: { user: true },
    });
  });

  it("should not apply status filter when status is 'all'", async () => {
    const filters: PlanReportFilterOptions = { status: "all" };

    await reportRepository.getPlanReports(filters);

    expect(prisma.request.findMany).toHaveBeenCalledWith({
      where: {},
      skip: undefined,
      take: undefined,
      orderBy: { createdOn: "desc" },
      include: { user: true },
    });
  });

  it("should apply startDate filter correctly", async () => {
    const startDate = "2023-01-01";
    const filters: PlanReportFilterOptions = { startDate };

    await reportRepository.getPlanReports(filters);

    expect(prisma.request.findMany).toHaveBeenCalledWith({
      where: { createdOn: { gte: new Date(startDate) } },
      skip: undefined,
      take: undefined,
      orderBy: { createdOn: "desc" },
      include: { user: true },
    });
  });

  it("should apply endDate filter correctly", async () => {
    const endDate = "2023-01-31";
    const filters: PlanReportFilterOptions = { endDate };

    await reportRepository.getPlanReports(filters);

    expect(prisma.request.findMany).toHaveBeenCalledWith({
      where: { createdOn: { lte: new Date(endDate) } },
      skip: undefined,
      take: undefined,
      orderBy: { createdOn: "desc" },
      include: { user: true },
    });
  });

  it("should apply both date range filters correctly", async () => {
    const startDate = "2023-01-01";
    const endDate = "2023-01-31";
    const filters: PlanReportFilterOptions = { startDate, endDate };

    await reportRepository.getPlanReports(filters);

    expect(prisma.request.findMany).toHaveBeenCalledWith({
      where: {
        createdOn: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      skip: undefined,
      take: undefined,
      orderBy: { createdOn: "desc" },
      include: { user: true },
    });
  });

  it("should apply pagination correctly", async () => {
    const pagination: PaginationOptions = { page: 2, limit: 10 };

    await reportRepository.getPlanReports(undefined, pagination);

    expect(prisma.request.findMany).toHaveBeenCalledWith({
      where: {},
      skip: 10, // (page - 1) * limit
      take: 10,
      orderBy: { createdOn: "desc" },
      include: { user: true },
    });
  });

  it("should apply all filters and pagination together", async () => {
    const filters: PlanReportFilterOptions = {
      search: "equipment",
      type: "MAINTENANCE",
      status: "scheduled",
      startDate: "2023-01-01",
      endDate: "2023-01-31",
    };
    const pagination: PaginationOptions = { page: 2, limit: 10 };

    await reportRepository.getPlanReports(filters, pagination);

    expect(prisma.request.findMany).toHaveBeenCalledWith({
      where: {
        OR: [{ medicalEquipment: { contains: "equipment" } }],
        requestType: "MAINTENANCE",
        status: "SCHEDULED",
        createdOn: {
          gte: new Date("2023-01-01"),
          lte: new Date("2023-01-31"),
        },
      },
      skip: 10,
      take: 10,
      orderBy: { createdOn: "desc" },
      include: { user: true },
    });
  });

  it("should handle database errors gracefully", async () => {
    const error = new Error("Database connection failed");
    (prisma.request.findMany as jest.Mock).mockRejectedValue(error);

    await expect(reportRepository.getPlanReports()).rejects.toThrow(
      "Database connection failed",
    );
  });
});

// Add tests for getMonthlyRequestCounts
describe("ReportRepository - getMonthlyRequestCounts", () => {
  let reportRepository: ReportRepository;
  const mockRequests = [
    {
      createdOn: new Date("2023-01-15"),
      requestType: "MAINTENANCE",
    },
    {
      createdOn: new Date("2023-01-20"),
      requestType: "CALIBRATION",
    },
    {
      createdOn: new Date("2023-02-15"),
      requestType: "MAINTENANCE",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    reportRepository = new ReportRepository();
    (prisma.request.findMany as jest.Mock).mockResolvedValue(mockRequests);
  });

  it("should group requests by month and count by type", async () => {
    const result = await reportRepository.getMonthlyRequestCounts();

    expect(prisma.request.findMany).toHaveBeenCalledWith({
      select: {
        createdOn: true,
        requestType: true,
      },
      where: {
        createdOn: {
          not: null,
        },
      },
    });

    expect(result).toEqual([
      { month: "2023-01", MAINTENANCE: 1, CALIBRATION: 1 },
      { month: "2023-02", MAINTENANCE: 1, CALIBRATION: 0 },
    ]);
  });

  it("should handle null createdOn values", async () => {
    const mockWithNull = [
      ...mockRequests,
      { createdOn: null, requestType: "MAINTENANCE" },
    ];
    (prisma.request.findMany as jest.Mock).mockResolvedValue(mockWithNull);

    const result = await reportRepository.getMonthlyRequestCounts();

    // Should ignore null createdOn values
    expect(result).toEqual([
      { month: "2023-01", MAINTENANCE: 1, CALIBRATION: 1 },
      { month: "2023-02", MAINTENANCE: 1, CALIBRATION: 0 },
    ]);
  });
});

// Add tests for getResultReports
describe("ReportRepository - getResultReports", () => {
  let reportRepository: ReportRepository;

  const mockMaintenanceResults = [
    {
      id: "m1",
      medicalEquipmentId: "equip-1",
      actionPerformed: "Cleaned filters",
      technician: "John Doe",
      result: "SUCCESS",
      maintenanceDate: new Date("2023-02-15"),
      createdBy: "user-1",
      createdOn: new Date("2023-02-15"),
      medicalEquipment: { id: "equip-1", name: "MRI Machine" },
    },
  ];

  const mockCalibrationResults = [
    {
      id: "c1",
      medicalEquipmentId: "equip-2",
      actionPerformed: "Calibrated sensors",
      technician: "Jane Smith",
      result: "SUCCESS_WITH_NOTES",
      calibrationDate: new Date("2023-02-10"),
      calibrationMethod: "Standard",
      nextCalibrationDue: new Date("2023-08-10"),
      createdBy: "user-2",
      createdOn: new Date("2023-02-10"),
      medicalEquipment: { id: "equip-2", name: "CT Scanner" },
    },
  ];

  const mockPartsResults = [
    {
      id: "p1",
      medicalEquipmentId: "equip-3",
      sparepartId: "part-1",
      actionPerformed: "Replaced filter",
      technician: "Bob Johnson",
      result: "FAILED_WITH_NOTES",
      replacementDate: new Date("2023-02-05"),
      createdBy: "user-3",
      createdOn: new Date("2023-02-05"),
      equipment: { id: "equip-3", name: "X-Ray Machine" },
      sparepart: { id: "part-1", name: "Air Filter" },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    reportRepository = new ReportRepository();

    // Default successful responses
    (prisma.maintenanceHistory.findMany as jest.Mock).mockResolvedValue(
      mockMaintenanceResults,
    );
    (prisma.maintenanceHistory.count as jest.Mock).mockResolvedValue(
      mockMaintenanceResults.length,
    );

    (prisma.calibrationHistory.findMany as jest.Mock).mockResolvedValue(
      mockCalibrationResults,
    );
    (prisma.calibrationHistory.count as jest.Mock).mockResolvedValue(
      mockCalibrationResults.length,
    );

    (prisma.partsHistory.findMany as jest.Mock).mockResolvedValue(
      mockPartsResults,
    );
    (prisma.partsHistory.count as jest.Mock).mockResolvedValue(
      mockPartsResults.length,
    );
  });

  it("should get all results with no filters or pagination", async () => {
    const result = await reportRepository.getResultReports();

    expect(prisma.maintenanceHistory.findMany).toHaveBeenCalled();
    expect(prisma.calibrationHistory.findMany).toHaveBeenCalled();
    expect(prisma.partsHistory.findMany).toHaveBeenCalled();

    expect(prisma.maintenanceHistory.count).toHaveBeenCalled();
    expect(prisma.calibrationHistory.count).toHaveBeenCalled();
    expect(prisma.partsHistory.count).toHaveBeenCalled();

    expect(result.total).toBe(3); // Total from all three sources
    expect(result.results.length).toBe(3); // All results combined
  });

  it("should apply search filter correctly", async () => {
    const filters: ResultReportFilterOptions = { search: "Machine" };

    await reportRepository.getResultReports(filters);

    // Check that search was applied to each history type
    expect(prisma.maintenanceHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          medicalEquipment: { name: { contains: "Machine" } },
        }),
      }),
    );

    expect(prisma.calibrationHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          medicalEquipment: { name: { contains: "Machine" } },
        }),
      }),
    );

    expect(prisma.partsHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          equipment: { name: { contains: "Machine" } },
        }),
      }),
    );
  });

  it("should apply result filter correctly", async () => {
    const filters: ResultReportFilterOptions = { result: "success" };

    await reportRepository.getResultReports(filters);

    expect(prisma.maintenanceHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ result: "SUCCESS" }),
      }),
    );

    expect(prisma.calibrationHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ result: "SUCCESS" }),
      }),
    );

    expect(prisma.partsHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ result: "SUCCESS" }),
      }),
    );
  });

  it("should apply success-with-notes result filter correctly", async () => {
    const filters: ResultReportFilterOptions = { result: "success-with-notes" };

    await reportRepository.getResultReports(filters);

    expect(prisma.maintenanceHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ result: "SUCCESS_WITH_NOTES" }),
      }),
    );
  });

  it("should apply failed-with-notes result filter correctly", async () => {
    const filters: ResultReportFilterOptions = { result: "failed-with-notes" };

    await reportRepository.getResultReports(filters);

    expect(prisma.maintenanceHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ result: "FAILED_WITH_NOTES" }),
      }),
    );
  });

  it("should apply date range filters correctly", async () => {
    const startDate = "2023-01-01";
    const endDate = "2023-03-01";
    const filters: ResultReportFilterOptions = { startDate, endDate };

    await reportRepository.getResultReports(filters);

    expect(prisma.maintenanceHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          maintenanceDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      }),
    );

    expect(prisma.calibrationHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          calibrationDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      }),
    );

    expect(prisma.partsHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          replacementDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      }),
    );
  });

  it("should filter by type MAINTENANCE correctly", async () => {
    const filters: ResultReportFilterOptions = { type: "MAINTENANCE" };

    await reportRepository.getResultReports(filters);

    expect(prisma.maintenanceHistory.findMany).toHaveBeenCalled();
    expect(prisma.calibrationHistory.findMany).not.toHaveBeenCalled();
    expect(prisma.partsHistory.findMany).not.toHaveBeenCalled();
  });

  it("should filter by type CALIBRATION correctly", async () => {
    const filters: ResultReportFilterOptions = { type: "CALIBRATION" };

    await reportRepository.getResultReports(filters);

    expect(prisma.maintenanceHistory.findMany).not.toHaveBeenCalled();
    expect(prisma.calibrationHistory.findMany).toHaveBeenCalled();
    expect(prisma.partsHistory.findMany).not.toHaveBeenCalled();
  });

  it("should filter by type PARTS correctly", async () => {
    const filters: ResultReportFilterOptions = { type: "PARTS" };

    await reportRepository.getResultReports(filters);

    expect(prisma.maintenanceHistory.findMany).not.toHaveBeenCalled();
    expect(prisma.calibrationHistory.findMany).not.toHaveBeenCalled();
    expect(prisma.partsHistory.findMany).toHaveBeenCalled();
  });

  it("should apply pagination correctly", async () => {
    const pagination: PaginationOptions = { page: 2, limit: 10 };

    await reportRepository.getResultReports(undefined, pagination);

    expect(prisma.maintenanceHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      }),
    );
  });

  it("should sort results by date correctly", async () => {
    // Override default results with specific dates for testing sort order
    (prisma.maintenanceHistory.findMany as jest.Mock).mockResolvedValue([
      {
        ...mockMaintenanceResults[0],
        maintenanceDate: new Date("2023-01-05"),
        id: "m2",
      },
    ]);

    (prisma.calibrationHistory.findMany as jest.Mock).mockResolvedValue([
      {
        ...mockCalibrationResults[0],
        calibrationDate: new Date("2023-01-10"),
        id: "c2",
      },
    ]);

    (prisma.partsHistory.findMany as jest.Mock).mockResolvedValue([
      {
        ...mockPartsResults[0],
        replacementDate: new Date("2023-01-15"),
        id: "p2",
      },
    ]);

    const result = await reportRepository.getResultReports();

    // Results should be sorted by date (most recent first)
    expect(result.results[0].id).toBe("p2");
    expect(result.results[1].id).toBe("c2");
    expect(result.results[2].id).toBe("m2");
  });
});

// Add tests for getSummaryReports
describe("ReportRepository - getSummaryReports", () => {
  let reportRepository: ReportRepository;
  const mockComments = [
    {
      id: "1",
      content: "This is a comment",
      createdAt: new Date("2023-01-15"),
      requestId: "req-1",
      userId: "user-1",
      request: {
        id: "req-1",
        requestType: "MAINTENANCE",
        medicalEquipment: "equipment-1",
      },
      user: { id: "user-1", name: "John Doe" },
    },
    {
      id: "2",
      content: "Another comment",
      createdAt: new Date("2023-01-20"),
      requestId: "req-2",
      userId: "user-2",
      request: {
        id: "req-2",
        requestType: "CALIBRATION",
        medicalEquipment: "equipment-2",
      },
      user: { id: "user-2", name: "Jane Smith" },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    reportRepository = new ReportRepository();

    // Default successful responses
    (prisma.comment.findMany as jest.Mock).mockResolvedValue(mockComments);
    (prisma.comment.count as jest.Mock).mockResolvedValue(mockComments.length);
  });

  it("should get comments with no filters or pagination", async () => {
    const result = await reportRepository.getSummaryReports();

    expect(prisma.comment.findMany).toHaveBeenCalledWith({
      where: {},
      skip: undefined,
      take: undefined,
      orderBy: { createdAt: "desc" },
      include: { request: true, user: true },
    });

    expect(prisma.comment.count).toHaveBeenCalledWith({ where: {} });
    expect(result).toEqual({
      comments: mockComments,
      total: mockComments.length,
    });
  });

  it("should apply search filter correctly", async () => {
    const filters: SummaryReportFilterOptions = { search: "equipment" };

    await reportRepository.getSummaryReports(filters);

    expect(prisma.comment.findMany).toHaveBeenCalledWith({
      where: {
        request: {
          medicalEquipment: { contains: "equipment" },
        },
      },
      skip: undefined,
      take: undefined,
      orderBy: { createdAt: "desc" },
      include: { request: true, user: true },
    });
  });

  it("should apply request type filter correctly", async () => {
    const filters: SummaryReportFilterOptions = { type: "MAINTENANCE" };

    await reportRepository.getSummaryReports(filters);

    expect(prisma.comment.findMany).toHaveBeenCalledWith({
      where: { request: { requestType: "MAINTENANCE" } },
      skip: undefined,
      take: undefined,
      orderBy: { createdAt: "desc" },
      include: { request: true, user: true },
    });
  });

  it("should apply date range filters correctly", async () => {
    const startDate = "2023-01-01";
    const endDate = "2023-01-31";
    const filters: SummaryReportFilterOptions = { startDate, endDate };

    await reportRepository.getSummaryReports(filters);

    expect(prisma.comment.findMany).toHaveBeenCalledWith({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      skip: undefined,
      take: undefined,
      orderBy: { createdAt: "desc" },
      include: { request: true, user: true },
    });
  });

  it("should apply pagination correctly", async () => {
    const pagination: PaginationOptions = { page: 2, limit: 10 };

    await reportRepository.getSummaryReports(undefined, pagination);

    expect(prisma.comment.findMany).toHaveBeenCalledWith({
      where: {},
      skip: 10,
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { request: true, user: true },
    });
  });

  it("should combine search and type filters correctly", async () => {
    const filters: SummaryReportFilterOptions = {
      search: "equipment",
      type: "MAINTENANCE",
    };

    await reportRepository.getSummaryReports(filters);

    expect(prisma.comment.findMany).toHaveBeenCalledWith({
      where: {
        request: {
          medicalEquipment: { contains: "equipment" },
          requestType: "MAINTENANCE",
        },
      },
      skip: undefined,
      take: undefined,
      orderBy: { createdAt: "desc" },
      include: { request: true, user: true },
    });
  });
});

// Add this test suite to ensure full coverage of mapResultStatus method
describe("ReportRepository - edge cases coverage", () => {
  let reportRepository: ReportRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    reportRepository = new ReportRepository();
  });

  it("should apply unknown result filter and resolve to empty string", async () => {
    // This test covers the default case in mapResultStatus
    const filters: ResultReportFilterOptions = {
      result: "unknown-value" as any, // Force an unknown value to trigger default case
    };

    await reportRepository.getResultReports(filters);

    // Verify that all history queries were called with empty result
    expect(prisma.maintenanceHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ result: "" }),
      }),
    );

    expect(prisma.calibrationHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ result: "" }),
      }),
    );

    expect(prisma.partsHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ result: "" }),
      }),
    );
  });

  it("should handle null search criteria properly", async () => {
    const filters: ResultReportFilterOptions = {
      search: null as any,
    };

    await reportRepository.getResultReports(filters);

    // Verify that the search filter wasn't applied (no medicalEquipment.name filter)
    expect(prisma.maintenanceHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.not.objectContaining({
          medicalEquipment: expect.anything(),
        }),
      }),
    );
  });
});
