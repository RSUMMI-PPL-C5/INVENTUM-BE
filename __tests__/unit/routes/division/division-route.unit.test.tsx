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
  }));
});

describe('Division Routes', () => {
  test('router should be defined', () => {
    expect(divisionRoutes).toBeDefined();
  });
  
  test('router should be created with Router()', () => {
    expect(Router).toHaveBeenCalled();
  });
  
  test('router should have routes registered', () => {
    // The routes are registered in the module itself when imported
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    
    // Check that all the expected routes are registered
    expect(mockRouter.get).toHaveBeenCalledWith('/', expect.any(Function));
    expect(mockRouter.get).toHaveBeenCalledWith('/all', expect.any(Function));
    expect(mockRouter.get).toHaveBeenCalledWith('/with-user-count', expect.any(Function));
    
    // Check the total number of routes
    expect(mockRouter.get).toHaveBeenCalledTimes(3);
  });
});