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
jest.mock("../../../../src/controllers/division.controller", () => {
  return jest.fn().mockImplementation(() => ({
    addDivision: jest.fn(),
    getDivisionsTree: jest.fn(),
    getAllDivisions: jest.fn(),
    getDivisionsWithUserCount: jest.fn(),
    getDivisionById: jest.fn(),
    updateDivision: jest.fn(),
    deleteDivision: jest.fn(),
  }));
});

// Mock middleware with explicit any types and unused args as _
jest.mock("../../../../src/middleware/verifyToken", () =>
  jest.fn((_req: any, _res: any, next: any) => next()),
);
jest.mock("../../../../src/middleware/authorizeRole", () =>
  jest.fn(() => (_req: any, _res: any, next: any) => next()),
);

// Import the route after all mocks
import "../../../../src/routes/division.route";

describe("Division Routes", () => {
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

  it("should register POST / route", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.post).toHaveBeenCalledWith("/", expect.any(Function));
  });

  it("should register GET / route", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.get).toHaveBeenCalledWith("/", expect.any(Function));
  });

  it("should register GET /all route", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.get).toHaveBeenCalledWith("/all", expect.any(Function));
  });

  it("should register GET /with-user-count route", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.get).toHaveBeenCalledWith(
      "/with-user-count",
      expect.any(Function),
    );
  });

  it("should register GET /:id route", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.get).toHaveBeenCalledWith("/:id", expect.any(Function));
  });

  it("should register PUT /:id route", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.put).toHaveBeenCalledWith("/:id", expect.any(Function));
  });

  it("should register DELETE /:id route", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.delete).toHaveBeenCalledWith(
      "/:id",
      expect.any(Function),
    );
  });
});
