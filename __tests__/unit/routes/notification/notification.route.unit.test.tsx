import { Router } from "express";

// Mock express.Router
jest.mock("express", () => {
  const mockRouter = {
    use: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnThis(),
    post: jest.fn().mockReturnThis(),
    patch: jest.fn().mockReturnThis(),
  };
  return {
    Router: jest.fn(() => mockRouter),
  };
});

// Mock controller
jest.mock("../../../../src/controllers/notification.controller", () => {
  return jest.fn().mockImplementation(() => ({
    getAllNotifications: jest.fn(),
    getNotificationById: jest.fn(),
    getMyNotifications: jest.fn(),
    markAsRead: jest.fn(),
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
import "../../../../src/routes/notification.route";

describe("Notification Routes", () => {
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

  it("should register GET / route for getAllNotifications", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.get).toHaveBeenCalledWith("/", expect.any(Function));
  });

  it("should register GET /:id route for getNotificationById", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.get).toHaveBeenCalledWith("/:id", expect.any(Function));
  });

  // Check that authorizeRoles was called with the correct role
  it("should authorize only Fasum role", () => {
    const mockAuthorizeRoles = require("../../../../src/middleware/authorizeRole");
    expect(mockAuthorizeRoles).toHaveBeenCalledWith("Fasum");
  });
});
