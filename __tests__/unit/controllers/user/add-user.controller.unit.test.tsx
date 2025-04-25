import { Request, Response } from "express";
import UserController from "../../../../src/controllers/user.controller";
import UserService from "../../../../src/services/user.service";
import AppError from "../../../../src/utils/appError";
import { validationResult } from "express-validator";
import { getJakartaTime } from "../../../../src/utils/date.utils";

// Mock dependencies
jest.mock("../../../../src/services/user.service");
jest.mock("express-validator", () => ({
  validationResult: jest.fn(),
}));
jest.mock("../../../../src/utils/date.utils", () => ({
  getJakartaTime: jest.fn(),
}));

const mockValidationResult = validationResult as jest.MockedFunction<
  typeof validationResult
>;
const mockGetJakartaTime = getJakartaTime as jest.MockedFunction<
  typeof getJakartaTime
>;

describe("UserController - createUser", () => {
  let userController: UserController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockUserService: jest.Mocked<UserService>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockRequest = {
      body: {
        email: "test@example.com",
        username: "testuser",
        password: "password123",
        role: "user",
        fullname: "Test User",
        nokar: "123456",
        divisiId: 1,
        waNumber: "081234567890",
      },
      user: { userId: 2 },
    };

    mockUserService = new UserService() as jest.Mocked<UserService>;
    (UserService as jest.Mock).mockImplementation(() => mockUserService);

    userController = new UserController();
  });

  it("should successfully create a user and return 201", async () => {
    mockGetJakartaTime.mockReturnValue(new Date("2025-04-20T10:00:00Z"));

    const mockNewUser = { id: 1, ...mockRequest.body };
    mockUserService.createUser.mockResolvedValue(mockNewUser);

    await userController.createUser(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockUserService.createUser).toHaveBeenCalledWith({
      ...mockRequest.body,
      createdBy: 2,
    });
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: "success",
      data: mockNewUser,
    });
  });

  it("should handle AppError and return the appropriate status code", async () => {
    const appError = new AppError("Email already exists", 409);
    mockUserService.createUser.mockRejectedValue(appError);

    await userController.createUser(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: "error",
      statusCode: 409,
      message: "Email already exists",
    });
  });

  it("should handle generic errors and return 500", async () => {
    mockUserService.createUser.mockRejectedValue(new Error("Database error"));

    await userController.createUser(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: "error",
      statusCode: 500,
      message: "Database error",
    });
  });

  it("should use data from request body and user ID", async () => {
    mockGetJakartaTime.mockReturnValue(new Date("2025-04-20T10:00:00Z"));

    const customRequest = {
      body: {
        email: "custom@example.com",
        username: "customuser",
        password: "custom123",
        role: "admin",
        fullname: "Custom User",
        nokar: "654321",
        divisiId: 2,
        waNumber: "089876543210",
      },
      user: { userId: 5 },
    };

    // Change id from number to string
    const mockCustomUser = { id: "2", ...customRequest.body };
    mockUserService.createUser.mockResolvedValue(mockCustomUser);

    await userController.createUser(
      customRequest as unknown as Request,
      mockResponse as Response,
    );

    expect(mockUserService.createUser).toHaveBeenCalledWith({
      ...customRequest.body,
      createdBy: 5,
    });
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: "success",
      data: mockCustomUser,
    });
  });
});
