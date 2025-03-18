import { Request, Response } from "express";
import AppError from "../../../src/utils/appError";
import authorizeRoles from "../../../src/middleware/authorizeRoles";

// Mocking the Request, Response, and Next Function
let mockRequest: Partial<Request>;
let mockResponse: Partial<Response>;
let next: jest.Mock;

beforeEach(() => {
  mockRequest = {}; // Reset mockRequest
  mockResponse = {
    status: jest.fn().mockReturnThis(), // Mock the status method to chain
    json: jest.fn().mockReturnThis(), // Mock the json method to chain
  };
  next = jest.fn(); // Mock next function
});

describe("authorizeRoles middleware", () => {
  it("should return 403 if the role is not allowed", () => {
    mockRequest.user = { role: "user" }; // User with a non-admin role
    const roles = ["admin"];

    // Call the middleware with the mock request, response, and next function
    authorizeRoles(...roles)(
      mockRequest as Request,
      mockResponse as Response,
      next,
    );

    // Check if next() was called with the error
    expect(next).toHaveBeenCalledWith(
      new AppError("Forbidden. You do not have access.", 403),
    );
    expect(mockResponse.status).not.toHaveBeenCalled(); // status should not be called
    expect(mockResponse.json).not.toHaveBeenCalled(); // json should not be called
  });

  it("should return 403 if no user found in the token", () => {
    mockRequest.user = undefined; // No user in request (invalid token)

    // Call the middleware with the mock request, response, and next function
    authorizeRoles("admin")(
      mockRequest as Request,
      mockResponse as Response,
      next,
    );

    // Check if next() was called with the error
    expect(next).toHaveBeenCalledWith(
      new AppError("Unauthorized. No user found in token.", 403),
    );
    expect(mockResponse.status).not.toHaveBeenCalled(); // status should not be called
    expect(mockResponse.json).not.toHaveBeenCalled(); // json should not be called
  });

  it("should call next if the user role is allowed", () => {
    mockRequest.user = { role: "admin" }; // User with the allowed role
    const roles = ["admin", "superadmin"];

    // Call the middleware with the mock request, response, and next function
    authorizeRoles(...roles)(
      mockRequest as Request,
      mockResponse as Response,
      next,
    );

    // Check that next() was called since the role is allowed
    expect(next).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled(); // status should not be set
    expect(mockResponse.json).not.toHaveBeenCalled(); // json should not be called
  });
});
