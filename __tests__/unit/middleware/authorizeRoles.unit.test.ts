import { Request, Response, NextFunction } from "express";
import authorizeRoles from "../../../src/middleware/authorizeRole";

describe("authorizeRoles Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("should call next if user has an authorized role", () => {
    req.user = { role: "Admin" }; // Mock user role
    const middleware = authorizeRoles("Admin", "User", "Fasum");

    middleware(req as Request, res as Response, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it("should return 403 if user role is not authorized", () => {
    req.user = { role: "Guest" }; // Mock unauthorized role
    const middleware = authorizeRoles("Admin", "User", "Fasum");

    middleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Access Denied. Insufficient permissions.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 403 if user is not authenticated", () => {
    req.user = undefined; // No user object
    const middleware = authorizeRoles("Admin", "User", "Fasum");

    middleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Access Denied. Insufficient permissions.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next if user has the 'User' role", () => {
    req.user = { role: "User" }; // Mock user role
    const middleware = authorizeRoles("Admin", "User", "Fasum");

    middleware(req as Request, res as Response, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it("should call next if user has the 'Fasum' role", () => {
    req.user = { role: "Fasum" }; // Mock user role
    const middleware = authorizeRoles("Admin", "User", "Fasum");

    middleware(req as Request, res as Response, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
