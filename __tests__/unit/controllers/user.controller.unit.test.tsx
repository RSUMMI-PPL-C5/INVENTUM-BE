import { Request, Response } from "express";
import { validationResult } from "express-validator";
import UserController from "../../../src/controllers/user.controller";
import UserService from "../../../src/services/user.service";

jest.mock("express-validator", () => ({
  validationResult: jest.fn(),
}));

jest.mock("../../../src/services/user.service", () => {
  return jest.fn().mockImplementation(() => ({
    getUsers: jest.fn(),
    getFilteredUsers: jest.fn(),
  }));
});

const mockUserService = new UserService({} as any) as jest.Mocked<UserService>;
const userController = new UserController(mockUserService);
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

  it("should return 400 if validation fails", async () => {
    (validationResult as unknown as jest.Mock).mockReturnValueOnce({
      isEmpty: () => false,
      array: () => [{ msg: "'divisiId must contain numbers'" }],
    });

    await userController.getUsers(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(responseObject).toEqual({ error: "Invalid input data" });
  });

  it("should call getUsers when no filters are present", async () => {
    (validationResult as unknown as jest.Mock).mockReturnValueOnce({
      isEmpty: () => true,
    });
    mockRequest.query = {};
    mockUserService.getUsers.mockResolvedValueOnce(mockUsers);

    await userController.getUsers(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockUserService.getUsers).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(responseObject).toEqual(mockUsers);
  });

  it("should call getFilteredUsers with correct filters when filters are present", async () => {
    (validationResult as unknown as jest.Mock).mockReturnValueOnce({
      isEmpty: () => true,
    });
    mockRequest.query = {
      role: ["User"],
      divisiId: [1] as any,
      createdOnStart: new Date("2022-01-01") as any,
      createdOnEnd: new Date("2022-01-03") as any,
      modifiedOnStart: new Date("2022-01-03") as any,
      modifiedOnEnd: new Date("2022-01-05") as any,
    };
    mockUserService.getFilteredUsers.mockResolvedValueOnce([mockUsers[0]]);

    await userController.getUsers(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockUserService.getFilteredUsers).toHaveBeenCalledWith({
      role: ["User"],
      divisiId: [1],
      createdOnStart: new Date("2022-01-01"),
      createdOnEnd: new Date("2022-01-03"),
      modifiedOnStart: new Date("2022-01-03"),
      modifiedOnEnd: new Date("2022-01-05"),
    });
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(responseObject).toEqual([mockUsers[0]]);
  });

  it("should be able to take multiple role and division values", async () => {
    (validationResult as unknown as jest.Mock).mockReturnValueOnce({
      isEmpty: () => true,
    });
    mockRequest.query = {
      role: ["User", "Admin"],
      divisiId: [1, 2] as any,
    };
    mockUserService.getFilteredUsers.mockResolvedValueOnce(mockUsers);

    await userController.getUsers(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockUserService.getFilteredUsers).toHaveBeenCalledWith({
      role: ["User", "Admin"],
      divisiId: [1, 2],
    });
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(responseObject).toEqual(mockUsers);
  });
});
