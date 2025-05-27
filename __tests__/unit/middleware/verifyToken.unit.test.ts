import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";

// Mock fast-jwt before importing the module that uses it
jest.mock("fast-jwt", () => {
  const mockVerifier = jest.fn();
  return {
    createVerifier: jest.fn(() => mockVerifier),
    mockVerifierFunction: mockVerifier, // Export for test access
  };
});

import * as fastJwt from "fast-jwt";
import verifyToken from "../../../src/middleware/verifyToken";

const mockVerifier = (fastJwt as any).mockVerifierFunction;

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

    // Reset mock between tests
    mockVerifier.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Positive Cases
  it("should decode a valid token and call next()", () => {
    const validToken = "valid.jwt.token";
    const decodedPayload: JwtPayload = { id: "12345", role: "user" };

    (req.header as jest.Mock).mockReturnValue(`Bearer ${validToken}`);
    mockVerifier.mockReturnValue(decodedPayload);

    verifyToken(req as Request, res as Response, next);

    expect(mockVerifier).toHaveBeenCalledWith(validToken);
    expect(req.user).toEqual(decodedPayload);
    expect(next).toHaveBeenCalled();
  });

  // Negative Cases
  it("should return 401 if no token is provided", () => {
    (req.header as jest.Mock).mockReturnValue(undefined);

    verifyToken(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Access Denied",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if token is expired", () => {
    const expiredToken = "expired.token";
    const tokenError = new Error("Token expired");
    tokenError.name = "TokenExpiredError";

    (req.header as jest.Mock).mockReturnValue(`Bearer ${expiredToken}`);
    mockVerifier.mockImplementation(() => {
      throw tokenError;
    });

    verifyToken(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token expired" });
    expect(next).not.toHaveBeenCalled();
  });
  it("should return 401 if token signature is invalid", () => {
    const invalidToken = "invalid.signature.token";
    const signatureError = new Error("Signature verification failed");

    (req.header as jest.Mock).mockReturnValue(`Bearer ${invalidToken}`);
    mockVerifier.mockImplementation(() => {
      throw signatureError;
    });

    verifyToken(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid token: Signature verification failed",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 with specific error message for other JWT errors", () => {
    const badToken = "bad.token";
    const otherError = new Error("Malformed token");

    (req.header as jest.Mock).mockReturnValue(`Bearer ${badToken}`);
    mockVerifier.mockImplementation(() => {
      throw otherError;
    });

    verifyToken(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid token: Malformed token",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 400 for non-Error type failures", () => {
    const strangeToken = "strange.token";
    const errorMessage = "Unexpected error type";

    (req.header as jest.Mock).mockReturnValue(`Bearer ${strangeToken}`);
    mockVerifier.mockImplementation(() => {
      throw errorMessage; // Simulating a non-Error type failure
    });

    verifyToken(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Authentication failed" });
    expect(next).not.toHaveBeenCalled();
  });
});
