import { Router } from "express";
import divisionRoutes from "../../../../src/routes/division.routes";

// Need to mock these before importing the route file
jest.mock("express", () => {
  const mockRouter = {
    get: jest.fn().mockReturnThis(),
    post: jest.fn().mockReturnThis(),
    put: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    name: "router",
  };

  return {
    Router: jest.fn(() => mockRouter),
  };
});

jest.mock("../../../../src/controllers/division.controller", () => {
  return jest.fn().mockImplementation(() => ({
    getDivisionsTree: jest.fn(),
    getAllDivisions: jest.fn(),
    getDivisionsWithUserCount: jest.fn(),
    getDivisionById: jest.fn(),
    deleteDivision: jest.fn(),
  }));
});

describe("Division Routes - GET", () => {
  test("router should be defined", () => {
    expect(divisionRoutes).toBeDefined();
  });

  test("router should be created with Router()", () => {
    expect(Router).toHaveBeenCalled();
  });

  test("router should have routes registered", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;

    // Check all GET routes
    expect(mockRouter.get).toHaveBeenCalledWith(
      "/",
      expect.any(Function), // Middleware
      expect.any(Function), // Controller method
    );
    expect(mockRouter.get).toHaveBeenCalledWith(
      "/all",
      expect.any(Function),
      expect.any(Function),
    );
    expect(mockRouter.get).toHaveBeenCalledWith(
      "/with-user-count",
      expect.any(Function),
      expect.any(Function),
    );
    expect(mockRouter.get).toHaveBeenCalledWith(
      "/:id",
      expect.any(Function),
      expect.any(Function),
    );

    expect(mockRouter.get).toHaveBeenCalledTimes(4);
  });
});

describe("Division Routes - DELETE", () => {
  it("should register DELETE /:id route", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;

    expect(mockRouter.delete).toHaveBeenCalledWith(
      "/:id",
      expect.any(Function), // Middleware
      expect.any(Function), // Controller method
    );
  });
});
