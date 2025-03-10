import { Request, Response } from "express";
import { searchUser } from "../../../src/controllers/user.controller";
import UserService from "../../../src/services/user.service";

jest.mock("../../../src/services/user.service");

describe("User Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockUserService: jest.Mocked<UserService>;

  beforeEach(() => {
    mockUserService = new UserService() as jest.Mocked<UserService>;
    mockRequest = { query: {} };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("searchUser", () => {
    it("should return users when a valid name is provided", async () => {
      const mockUsers = [{ id: 1, name: "John Doe" }];
      mockRequest.query = { name: "John" };
      mockUserService.searchUser = jest.fn().mockResolvedValue(mockUsers);

      const controller = searchUser(mockUserService);
      await controller(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.searchUser).toHaveBeenCalledWith("John");
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUsers);
    });

    it("should return 400 when name query is missing", async () => {
      mockRequest.query = {};

      const controller = searchUser(mockUserService);
      await controller(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.searchUser).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid name query",
      });
    });

    it("should return 400 when name query is not a string", async () => {
      mockRequest.query = { name: ["John", "Doe"] as any };

      const controller = searchUser(mockUserService);
      await controller(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.searchUser).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid name query",
      });
    });

    it("should return 500 when service throws an Error", async () => {
      mockRequest.query = { name: "John" };
      const errorMessage = "Database connection failed";
      mockUserService.searchUser = jest
        .fn()
        .mockRejectedValue(new Error(errorMessage));

      const controller = searchUser(mockUserService);
      await controller(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.searchUser).toHaveBeenCalledWith("John");
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });

    it("should return 500 with generic message when service throws a non-Error", async () => {
      mockRequest.query = { name: "John" };
      mockUserService.searchUser = jest
        .fn()
        .mockRejectedValue("Some string error");

      const controller = searchUser(mockUserService);
      await controller(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.searchUser).toHaveBeenCalledWith("John");
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "An unknown error occurred",
      });
    });
  });
});
