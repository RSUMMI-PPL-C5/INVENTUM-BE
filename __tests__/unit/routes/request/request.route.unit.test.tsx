import { Router } from "express";

// Mock express.Router
jest.mock("express", () => {
  const mockRouter = {
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
jest.mock("../../../../src/controllers/request.controller", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      getRequestById: jest.fn(),
      getAllRequests: jest.fn(),
      getAllRequestMaintenance: jest.fn(),
    })),
  };
});

// Mock middleware
jest.mock("../../../../src/middleware/verifyToken", () =>
  jest.fn((_req: any, _res: any, next: any) => next()),
);

// Import the route after all mocks are defined
import "../../../../src/routes/request.route";

describe("Request Routes", () => {
  it("should create router with Router()", () => {
    expect(Router).toHaveBeenCalled();
  });

  it("should register GET /all route with verifyToken middleware", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.get).toHaveBeenCalledWith(
      "/all",
      expect.any(Function),
      expect.any(Function),
    );
  });

  it("should register GET /:id route with verifyToken middleware", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.get).toHaveBeenCalledWith(
      "/:id",
      expect.any(Function),
      expect.any(Function),
    );
  });

  it("should register GET /maintenance route with verifyToken middleware", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.get).toHaveBeenCalledWith(
      "/maintenance",
      expect.any(Function),
      expect.any(Function),
    );
  });
});
