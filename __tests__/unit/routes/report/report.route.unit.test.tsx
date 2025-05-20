import { Router } from "express";

// Mock express.Router
jest.mock("express", () => {
  const mockRouter = {
    use: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnThis(),
    post: jest.fn().mockReturnThis(),
    put: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  };
  return {
    Router: jest.fn(() => mockRouter),
  };
});

// Mock controller
jest.mock("../../../../src/controllers/report.controller", () => {
  return jest.fn().mockImplementation(() => ({
    getMonthlyRequestCounts: jest.fn(),
    getRequestStatusReport: jest.fn(),
    exportAllData: jest.fn(),
    getPlanReports: jest.fn(),
    getResultReports: jest.fn(),
    getSummaryReports: jest.fn(),
  }));
});

// Mock middleware with explicit any types and unused args as _
jest.mock("../../../../src/middleware/verifyToken", () =>
  jest.fn((_req: any, _res: any, next: any) => next()),
);

jest.mock("../../../../src/middleware/authorizeRole", () =>
  jest.fn(() => (_req: any, _res: any, next: any) => next()),
);

jest.mock("../../../../src/validations/report.validation", () => ({
  exportDataValidation: jest.fn((_req: any, _res: any, next: any) => next()),
}));

jest.mock("../../../../src/middleware/validateRequest", () => ({
  validateRequest: jest.fn((_req: any, _res: any, next: any) => next()),
}));

// Import the route after all mocks
import "../../../../src/routes/report.route";

describe("Report Routes", () => {
  it("should create router with Router()", () => {
    expect(Router).toHaveBeenCalled();
  });

  it("should use verifyToken and authorizeRoles middleware", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.use).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
    );
  });

  it("should register GET /monthly-requests route", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.get).toHaveBeenCalledWith(
      "/monthly-requests",
      expect.any(Function),
    );
  });

  it("should register GET /request-status route", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.get).toHaveBeenCalledWith(
      "/request-status",
      expect.any(Function),
    );
  });

  it("should register GET /plans route", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.get).toHaveBeenCalledWith("/plans", expect.any(Function));
  });

  it("should register GET /results route", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.get).toHaveBeenCalledWith(
      "/results",
      expect.any(Function),
    );
  });

  it("should register GET /export route with validation", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.get).toHaveBeenCalledWith(
      "/export",
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
    );
  });

  it("should register GET /summary route", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.get).toHaveBeenCalledWith(
      "/summary",
      expect.any(Function),
    );
  });
});
