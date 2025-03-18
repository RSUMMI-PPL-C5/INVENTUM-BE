import { Request, Response } from "express";
import { validationResult } from "express-validator";
import UserController from "../../../src/controllers/user.controller";
import UserService from "../../../src/services/user.service";

// Mocking dependencies
jest.mock("express-validator", () => ({
  validationResult: jest.fn(),
}));

jest.mock("../../../src/services/user.service", () => {
  return jest.fn().mockImplementation(() => ({
    getUsers: jest.fn(),
    getFilteredUsers: jest.fn(),
    searchUser: jest.fn(), // Mock searchUser method
  }));
});

const mockUserService = new UserService() as jest.Mocked<UserService>;
const userController = new UserController();
const mockUsers = [
  {
    id: "1",
    email: "user1@example.com",
    username: "user1",
    password: "hashedpwd1",
    role: "User",
    fullname: "User One",
    nokar: "12345",
    divisiId: 1,
    waNumber: "123456789",
    createdBy: 1,
    createdOn: new Date("2022-01-02"),
    modifiedBy: null,
    modifiedOn: new Date("2022-01-04"),
    deletedBy: null,
    deletedOn: null,
  },
  {
    id: "2",
    email: "user2@example.com",
    username: "user2",
    password: "hashedpwd2",
    role: "Admin",
    fullname: "User Two",
    nokar: "67890",
    divisiId: 2,
    waNumber: "987654321",
    createdBy: 1,
    createdOn: new Date("2023-01-03"),
    modifiedBy: null,
    modifiedOn: new Date("2023-01-05"),
    deletedBy: null,
    deletedOn: null,
  },
];

describe("User Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    mockRequest = { query: {} };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((result) => {
        responseObject = result;
        return mockResponse;
      }),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call searchUser when search query is provided", async () => {
    const searchQuery = "user1";
    mockRequest.query = { search: searchQuery };

    // Mock searchUser to return mock data
    mockUserService.searchUser.mockResolvedValueOnce([mockUsers[0]]);

    await userController.getUsers(mockRequest as Request, mockResponse as Response);

    // Verify that searchUser was called with correct query
    expect(mockUserService.searchUser).toHaveBeenCalledWith(searchQuery);

    // Verify the response
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(responseObject).toEqual([mockUsers[0]]);
  });

  it("should return 400 if search query is invalid", async () => {
    mockRequest.query = { search: "12345" }; // Invalid search query

    await userController.getUsers(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(responseObject).toEqual({ error: "Invalid input data" });
  });
});
