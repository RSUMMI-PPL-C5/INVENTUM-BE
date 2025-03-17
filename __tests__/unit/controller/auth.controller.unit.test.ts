import { Request, Response } from "express";
import AuthController from "../../../src/controllers/auth.controller";
import AuthService from "../../../src/services/auth.service";
import AppError from "../../../src/utils/appError";

// Mock AuthService
jest.mock("../../../src/services/auth.service");
jest.mock("../../../src/middleware/verifyToken");

describe("AuthController", () => {
  let authController: AuthController;
  let mockLogin: jest.Mock;

  beforeEach(() => {
    // Clear all mocks before each test to ensure test isolation
    mockLogin = jest.fn();
    (AuthService as jest.Mock).mockImplementation(() => ({
      login: mockLogin,
    }));
    authController = new AuthController();
  });

  describe("verifyToken", () => {
    it("should return 200 and user data if token is valid", () => {
      const req = { user: { id: "123", username: "testuser" } } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      authController.verifyToken(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Token is valid",
        user: { id: "123", username: "testuser" },
      });
    });

    it("should return 401 if the token is invalid", () => {
      const req = { user: null } as unknown as Request; // Simulating invalid or missing token
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      authController.verifyToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Token is invalid or missing",
      });
    });
  });

  describe("login", () => {
    it("should return 200 and user data when login is successful", async () => {
      const req = {
        body: { username: "testuser", password: "password123" },
      } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      // Mock successful login behavior
      mockLogin.mockResolvedValue({
        id: "123",
        username: "testuser",
        email: "test@example.com",
        token: "mocked_token",
      });

      await authController.login(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        id: "123",
        username: "testuser",
        email: "test@example.com",
        token: "mocked_token",
      });
    });

    it("should return 400 when username or password is missing", async () => {
      const req = {
        body: { username: "testuser" }, // Missing password
      } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await authController.login(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Username and password are required",
      });
    });

    it("should return 401 when credentials are incorrect", async () => {
      const req = {
        body: { username: "testuser", password: "wrongpassword" },
      } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      // Mock failed login behavior (wrong credentials)
      mockLogin.mockResolvedValue(null);

      await authController.login(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid username or password",
      });
    });

    it("should return 404 when user is not found", async () => {
      const req = {
        body: { username: "unknownuser", password: "password123" },
      } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      // Mock behavior for a user not found
      mockLogin.mockResolvedValue(null);

      await authController.login(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "User not found",
      });
    });

    it("should return 500 if an unexpected error occurs", async () => {
      const req = {
        body: { username: "testuser", password: "password123" },
      } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      // Mock an error being thrown by the login service
      mockLogin.mockRejectedValue(new Error("Unexpected error"));

      await authController.login(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        statusCode: 500,
        message: "Internal Server Error",
      });
    });
  });
  describe("login", () => {
    it("should return 400 if username or password is missing", async () => {
      const req = {
        body: { username: "testuser" }, // Missing password
      } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
  
      await authController.login(req, res, jest.fn());
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Username and password are required",
      });
    });
  
    it("should return 404 if AppError is thrown", async () => {
      const req = {
        body: { username: "testuser", password: "wrongpassword" },
      } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
  
      // Simulate an AppError being thrown (e.g., user not found)
      mockLogin.mockRejectedValue(new AppError("User not found", 404));
  
      await authController.login(req, res, jest.fn());
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        statusCode: 404,
        message: "User not found",
      });
    });
  
    it("should return 500 if a general error occurs", async () => {
      const req = {
        body: { username: "testuser", password: "password123" },
      } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
  
      // Simulate a general error
      mockLogin.mockRejectedValue(new Error("Unexpected error"));
  
      await authController.login(req, res, jest.fn());
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        statusCode: 500,
        message: "Internal Server Error",
      });
    });
  });
});
