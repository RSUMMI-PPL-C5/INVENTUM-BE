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
jest.mock("../../../../src/controllers/sparepart.controller", () => {
  return jest.fn().mockImplementation(() => ({
    getSpareparts: jest.fn(),
    getSparepartById: jest.fn(),
    addSparepart: jest.fn(),
    updateSparepart: jest.fn(),
    deleteSparepart: jest.fn(),
  }));
});

// Mock middleware with explicit any types and unused args as _
jest.mock("../../../../src/middleware/verifyToken", () =>
  jest.fn((_req: any, _res: any, next: any) => next()),
);

jest.mock("../../../../src/middleware/authorizeRole", () =>
  jest.fn(() => (_req: any, _res: any, next: any) => next()),
);

// Mock validation
jest.mock(
  "../../../../src/validations/sparepartfilterquery.validation",
  () => ({
    sparepartFilterQueryValidation: jest.fn((_req: any, _res: any, next: any) =>
      next(),
    ),
  }),
);

jest.mock("../../../../src/validations/spareparts.validation", () => ({
  addSparepartValidation: jest.fn((_req: any, _res: any, next: any) => next()),
  updateSparepartValidation: jest.fn((_req: any, _res: any, next: any) =>
    next(),
  ),
}));

jest.mock("../../../../src/middleware/validateRequest", () => ({
  validateRequest: jest.fn((_req: any, _res: any, next: any) => next()),
}));

// Import the route after all mocks
import "../../../../src/routes/sparepart.route";

describe("Sparepart Routes", () => {
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

  it("should register GET / route with filter validation", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.get).toHaveBeenCalledWith(
      "/",
      expect.any(Function),
      expect.any(Function),
    );
  });

  it("should register GET /:id route", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.get).toHaveBeenCalledWith("/:id", expect.any(Function));
  });

  it("should register POST / route with validation", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.post).toHaveBeenCalledWith(
      "/",
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
    );
  });

  it("should register PUT /:id route with validation", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.put).toHaveBeenCalledWith(
      "/:id",
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
    );
  });

  it("should register DELETE /:id route", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.delete).toHaveBeenCalledWith(
      "/:id",
      expect.any(Function),
    );
  });
});
