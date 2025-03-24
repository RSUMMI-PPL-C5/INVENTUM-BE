import { Router } from 'express';
import divisionRoutes from '../../../../src/routes/division.route';

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
    addDivision: jest.fn(),
  }));
});

describe("Division Routes - ADD", () => {
  test("router should be defined", () => {
    expect(divisionRoutes).toBeDefined();
  });

  it("should register POST / route", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;

    expect(mockRouter.post).toHaveBeenCalledWith(
      "/",
      expect.any(Function),
      expect.any(Function),
    );
  });
});