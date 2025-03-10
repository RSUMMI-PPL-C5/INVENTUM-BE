import { Request, Response } from "express";
import { searchUser } from "../../../src/controllers/user.controller";
import UserService from "../../../src/services/user.service";

describe("User Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let mockUserService: jest.Mocked<UserService>;

  beforeEach(() => {
    jsonMock = jest.fn();
    req = {};
    res = {
      json: jsonMock,
      status: jest.fn().mockReturnThis(),
    };

    mockUserService = {
      searchUser: jest.fn(),
    } as any;
  });

  test("should return 200 and user data when found", async () => {
    const mockUsers = [
      {
        id: "1",
        fullname: "Azmy Arya Rizaldi",
        email: "azmy@gmail.com",
        username: "azmy",
        password: "password123",
        role: null,
        nokar: "12345",
        divisiId: null,
        waNumber: null,
        createdBy: 1,
        createdOn: new Date(),
        updatedBy: 1,
        updatedOn: new Date(),
        deletedBy: null,
        deletedOn: null,
        modifiedBy: null,
        modifiedOn: new Date(),
      },
    ];
    mockUserService.searchUser.mockResolvedValue(mockUsers);

    req.query = { name: "Azmy" };

    const controllerWithMock = searchUser(mockUserService);
    await controllerWithMock(req as Request, res as Response);

    expect(mockUserService.searchUser).toHaveBeenCalledWith("Azmy");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(mockUsers);
  });

  test("should return 400 if name query is missing", async () => {
    req.query = {};

    const controllerWithMock = searchUser(mockUserService);
    await controllerWithMock(req as Request, res as Response);

    expect(mockUserService.searchUser).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Invalid name query" });
  });

  test("should return empty array if no users found", async () => {
    mockUserService.searchUser.mockResolvedValue([]);

    req.query = { name: "Unknown" };

    const controllerWithMock = searchUser(mockUserService);
    await controllerWithMock(req as Request, res as Response);

    expect(mockUserService.searchUser).toHaveBeenCalledWith("Unknown");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith([]);
  });
});
