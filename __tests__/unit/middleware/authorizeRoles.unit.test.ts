import { Request, Response } from "express";
import authorizeRoles from "../../../src/middleware/authorizeRoles";

let mockRequest: Partial<Request>;
let mockResponse: Partial<Response>;
let next: jest.Mock;

beforeEach(() => {
  mockRequest = {};
  mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  next = jest.fn();
});

describe("authorizeRoles middleware", () => {
  it("should return 403 if the role is not allowed", () => {
    mockRequest.user = { role: "user" };
    const roles = ["admin"];

    authorizeRoles(...roles)(
      mockRequest as Request,
      mockResponse as Response,
      next,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Forbidden. You do not have access.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 403 if no user found in the token", () => {
    mockRequest.user = undefined;

    authorizeRoles("admin")(
      mockRequest as Request,
      mockResponse as Response,
      next,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Unauthorized. No user found in token.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next if the user role is allowed", () => {
    mockRequest.user = { role: "admin" };
    const roles = ["admin", "superadmin"];

    authorizeRoles(...roles)(
      mockRequest as Request,
      mockResponse as Response,
      next,
    );

    expect(next).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });
});
