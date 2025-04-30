import { Router } from "express";

// Mock express.Router
jest.mock("express", () => {
  const mockRouter = {
    get: jest.fn().mockReturnThis(),
    post: jest.fn().mockReturnThis(),
    put: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    use: jest.fn().mockReturnThis(), // Add use method for middleware
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
      getAllRequestCalibration: jest.fn(),
      createMaintenanceRequest: jest.fn(),
      createCalibrationRequest: jest.fn(), // Add missing controller methods
    })),
  };
});

// Mock middleware
jest.mock("../../../../src/middleware/verifyToken", () => jest.fn());
jest.mock("../../../../src/middleware/validateRequest", () => ({
  validateRequest: jest.fn(),
}));
jest.mock("../../../../src/validations/request.validation", () => ({
  createRequestValidation: jest.fn(),
}));
jest.mock("../../../../src/middleware/authorizeRole", () =>
  jest.fn().mockReturnValue(jest.fn()),
); // Add this mock

// Import the route after all mocks are defined
import "../../../../src/routes/request.route";

describe("Request Routes", () => {
  let mockRouter: any;

  beforeEach(() => {
    mockRouter = (Router as jest.Mock).mock.results[0].value;
  });

  it("should create router with Router()", () => {
    expect(Router).toHaveBeenCalled();
  });

  it("should apply verifyToken middleware globally", () => {
    expect(mockRouter.use).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
    );
  });

  it("should register GET /all route", () => {
    expect(mockRouter.get).toHaveBeenCalledWith("/all", expect.any(Function));
  });

  it("should register GET /:id route", () => {
    expect(mockRouter.get).toHaveBeenCalledWith("/:id", expect.any(Function));
  });

  it("should register GET /maintenance route", () => {
    expect(mockRouter.get).toHaveBeenCalledWith(
      "/maintenance",
      expect.any(Function),
    );
  });

  it("should register GET /calibration route", () => {
    expect(mockRouter.get).toHaveBeenCalledWith(
      "/calibration",
      expect.any(Function),
    );
  });

  it("should register POST /maintenance route with validation", () => {
    expect(mockRouter.post).toHaveBeenCalledWith(
      "/maintenance",
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
    );
  });

  it("should register POST /calibration route with validation", () => {
    expect(mockRouter.post).toHaveBeenCalledWith(
      "/calibration",
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
    );
  });
});
