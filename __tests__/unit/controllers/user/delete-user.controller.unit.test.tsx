import UserService from "../../../../src/services/user.service";
import UserController from "../../../../src/controllers/user.controller";
import { Request, Response } from "express";

jest.mock("../../../../src/services/user.service");

describe("UserController - DELETE", () => {
  let userController: UserController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockUserService: {
    deleteUser: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mocking the UserService methods
    mockUserService = {
      deleteUser: jest.fn(),
    };

    // Mocking the UserService implementation
    (UserService as jest.Mock).mockImplementation(() => mockUserService);

    userController = new UserController();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockRequest = {
      params: { id: "1" },
      user: { userId: "2" }, // Adding user with userId for authentication
    };
  });

  test("DELETE /user/:id - should delete user", async () => {
    const mockUser = {
      id: "1",
      email: "user1@example.com",
      username: "user1",
      password: "password1",
      role: "USER",
      fullname: "User One",
      nokar: "123",
      divisiId: 1,
      waNumber: "1234567890",
      createdBy: "1",
      createdOn: new Date(),
      modifiedBy: null,
      modifiedOn: null,
      deletedBy: "2",
      deletedOn: new Date(),
    };
    mockUserService.deleteUser.mockResolvedValue(mockUser);

    await userController.deleteUser(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockUserService.deleteUser).toHaveBeenCalledWith("1", "2");
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "User deleted successfully",
    });
  });

  test("DELETE /user/:id - should return 404 if user not found", async () => {
    mockUserService.deleteUser.mockResolvedValue(null);

    await userController.deleteUser(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockUserService.deleteUser).toHaveBeenCalledWith("1", "2");
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "User not found",
    });
  });

  test("DELETE /user/:id - should handle errors", async () => {
    const errorMessage = "Database error";
    mockUserService.deleteUser.mockRejectedValue(new Error(errorMessage));

    await userController.deleteUser(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockUserService.deleteUser).toHaveBeenCalledWith("1", "2");
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
  });
});