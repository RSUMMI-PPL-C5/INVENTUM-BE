import AuthController from "../../../src/controllers/auth.controller";
import AuthService from "../../../src/services/auth.service";
import { Request, Response, NextFunction } from "express";
import AppError from "../../../src/utils/appError";

jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("../../../src/services/auth.service");

describe("Auth Controller", () => {
  let authController: AuthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    authController = new AuthController();
    mockRequest = {
      body: {},
      user: undefined
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
  });

  describe("login", () => {
    it("should return 400 when username or password is missing", async () => {
      mockRequest.body = { username: "testuser" };

      await authController.login(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Username and password are required"
      });
    });

    it("should return 200 and user data when login is successful", async () => {
      mockRequest.body = { username: "testuser", password: "password123" };

      const mockUser = {
        id: "123",
        username: "testuser",
        email: "test@example.com",
        token: "mocked_token"
      };

      (AuthService.prototype.login as jest.Mock).mockResolvedValue(mockUser);

      await authController.login(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });

    it("should handle errors from AuthService", async () => {
      mockRequest.body = { username: "testuser", password: "password123" };

      const mockError = new AppError("Test error", 401);
      (AuthService.prototype.login as jest.Mock).mockRejectedValue(mockError);

      await authController.login(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        statusCode: 401,
        message: "Test error"
      });
    });

    it("should handle internal server errors", async () => {
      mockRequest.body = { username: "testuser", password: "password123" };

      const mockError = new Error("Internal Server Error");
      (AuthService.prototype.login as jest.Mock).mockRejectedValue(mockError);

      await authController.login(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        statusCode: 500,
        message: "Internal Server Error"
      });
    });
  });

  describe("verifyToken", () => {
    it("should return 200 and valid token message with user data", () => {
      mockRequest.user = {
        id: "123",
        username: "testuser",
        email: "test@example.com"
      };

      authController.verifyToken(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Token is valid",
        user: mockRequest.user
      });
    });
  });
});