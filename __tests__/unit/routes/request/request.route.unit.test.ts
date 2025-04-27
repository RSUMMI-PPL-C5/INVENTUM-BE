import { Router } from "express";

// Mock express.Router
jest.mock("express", () => {
  const mockRouter = {
    use: jest.fn().mockReturnThis(),
    post: jest.fn().mockReturnThis(),
  };
  return {
    Router: jest.fn(() => mockRouter),
  };
});

// Mock controller
jest.mock("../../../../src/controllers/request.controller", () => {
  return jest.fn().mockImplementation(() => ({
    createMaintenanceRequest: jest.fn(),
    createCalibrationRequest: jest.fn(),
  }));
});

// Mock middleware with explicit any types and unused args as _
jest.mock("../../../../src/middleware/verifyToken", () =>
  jest.fn((_req: any, _res: any, next: any) => next()),
);

jest.mock("../../../../src/validations/request.validation", () => ({
  createRequestValidation: jest.fn((_req: any, _res: any, next: any) => next()),
}));

jest.mock("../../../../src/middleware/validateRequest", () => ({
  validateRequest: jest.fn((_req: any, _res: any, next: any) => next()),
}));

// Import the route after all mocks
import "../../../../src/routes/request.route";

describe("Request Routes", () => {
  it("should create router with Router()", () => {
    expect(Router).toHaveBeenCalled();
  });

  it("should use verifyToken middleware", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.use).toHaveBeenCalledWith(expect.any(Function));
  });

  it("should register POST /maintenance route with validation", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.post).toHaveBeenCalledWith(
      "/maintenance",
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
    );
  });

  it("should register POST /calibration route with validation", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.post).toHaveBeenCalledWith(
      "/calibration",
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
    );
  });
});
