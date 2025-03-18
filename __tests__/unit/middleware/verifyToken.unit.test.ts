import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import verifyToken from "../../../src/middleware/verifyToken";

jest.mock("jsonwebtoken");

describe("verifyToken Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      header: jest.fn(),
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    process.env.JWT_SECRET_KEY = "test-secret-key";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Positive Cases
  it("should decode a valid token and call next()", () => {
    const validToken = "valid.jwt.token";
    const decodedPayload: JwtPayload = { id: "12345", role: "user" };

    (req.header as jest.Mock).mockReturnValue(`Bearer ${validToken}`);
    (jwt.verify as jest.Mock).mockReturnValue(decodedPayload);

    verifyToken(req as Request, res as Response, next);

    expect(jwt.verify).toHaveBeenCalledWith(validToken, "test-secret-key");
    expect(req.user).toEqual(decodedPayload);
    expect(next).toHaveBeenCalled();
  });

  // Negative Cases
  it("should return 401 if no token is provided", () => {
    (req.header as jest.Mock).mockReturnValue(undefined);

    verifyToken(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Access Denied. No token provided.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 500 if JWT_SECRET_KEY is missing", () => {
    delete process.env.JWT_SECRET_KEY;
    const token = "some.token";

    (req.header as jest.Mock).mockReturnValue(`Bearer ${token}`);

    verifyToken(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "JWT_SECRET_KEY is not set",
    });
  });

  it("should return 400 if token is invalid", () => {
    const invalidToken = "invalid.token";

    (req.header as jest.Mock).mockReturnValue(`Bearer ${invalidToken}`);
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("Invalid token");
    });

    verifyToken(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token." });
    expect(next).not.toHaveBeenCalled();
  });
});
