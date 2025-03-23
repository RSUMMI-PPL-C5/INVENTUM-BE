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

// Update mock controller to include getDivisionById
jest.mock("../../../../src/controllers/division.controller", () => {
  return jest.fn().mockImplementation(() => ({
    getDivisionsTree: jest.fn(),
    getAllDivisions: jest.fn(),
    getDivisionsWithUserCount: jest.fn(),
    getDivisionById: jest.fn() // Add this method
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
    expect(mockRouter.get).toHaveBeenCalledWith('/:id', expect.any(Function)); // Add this line
    
    // Update the expected count from 3 to 4
    expect(mockRouter.get).toHaveBeenCalledTimes(4);
  });
  
  test('router should register the getDivisionById route', () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    
    // Check specifically for the parameter route
    const paramRouteCall = mockRouter.get.mock.calls.find(
      (call: any[]) => call[0] === '/:id'
    );
    
    expect(paramRouteCall).toBeDefined();
    expect(paramRouteCall?.[0]).toBe('/:id');
    expect(paramRouteCall?.[1]).toEqual(expect.any(Function));
  });
});