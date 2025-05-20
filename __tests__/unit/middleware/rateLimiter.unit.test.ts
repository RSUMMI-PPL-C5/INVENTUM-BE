import { Request, Response, NextFunction } from "express";
import {
  loginLimiter,
  generalLimiter,
} from "../../../src/middleware/rateLimiter";

// Mock express-rate-limit
jest.mock("express-rate-limit", () => {
  return jest.fn().mockImplementation((options) => {
    // Return a middleware function that stores the options
    const middleware = (req: Request, res: Response, next: NextFunction) => {
      // Simply call next() to pass the request through
      next();
    };
    // Attach the options to the middleware function for testing
    (middleware as any).options = options;
    return middleware;
  });
});

describe("Rate Limiter Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    // Reset mocks before each test
    mockRequest = {
      ip: "192.168.1.1",
      method: "POST",
      path: "/auth",
      headers: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
      set: jest.fn(),
    };

    nextFunction = jest.fn();
  });

  describe("loginLimiter", () => {
    it("should execute middleware without errors", () => {
      loginLimiter(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );
      expect(nextFunction).toHaveBeenCalled();
    });

    it("should be configured with correct settings", () => {
      expect(loginLimiter).toBeDefined();
      const options = (loginLimiter as any).options;
      expect(options.windowMs).toBe(15 * 60 * 1000);
      expect(options.max).toBe(8);
      expect(options.standardHeaders).toBe("draft-7");
      expect(options.legacyHeaders).toBe(false);
      expect(options.message).toEqual({
        status: "error",
        statusCode: 429,
        message: "Too many login attempts. Please try again after 15 minutes",
      });
    });

    describe("keyGenerator functionality", () => {
      it("should return req.body.username if available", () => {
        const options = (loginLimiter as any).options;
        const req = {
          body: { username: "testuser" },
          ip: "192.168.1.2",
        } as any;
        expect(options.keyGenerator(req)).toBe("testuser");
      });

      it("should fallback to req.ip if username is not provided", () => {
        const options = (loginLimiter as any).options;
        const req = { body: {}, ip: "192.168.1.2" } as any;
        expect(options.keyGenerator(req)).toBe("192.168.1.2");
      });
    });
  });

  describe("generalLimiter", () => {
    it("should execute middleware without errors", () => {
      generalLimiter(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );
      expect(nextFunction).toHaveBeenCalled();
    });

    it("should be configured with correct settings", () => {
      expect(generalLimiter).toBeDefined();
      const options = (generalLimiter as any).options;
      expect(options.windowMs).toBe(60 * 1000);
      expect(options.max).toBe(30);
      expect(options.standardHeaders).toBe("draft-7");
      expect(options.legacyHeaders).toBe(false);
      expect(options.message).toEqual({
        status: "error",
        statusCode: 429,
        message: "Too many requests. Please try again later",
      });
    });
  });
});
