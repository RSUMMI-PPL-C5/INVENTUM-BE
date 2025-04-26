import UserController from "../../../../src/controllers/user.controller";
import UserService from "../../../../src/services/user.service";
import { Request, Response, NextFunction } from "express";

jest.mock("../../../../src/services/user.service");

describe("UserController - getUsers", () => {
  let controller: UserController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    controller = new UserController();
    req = { query: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("should get users successfully", async () => {
    const mockUsers = { data: [{ id: "1", name: "John Doe" }], total: 1 };
    (UserService.prototype.getUsers as jest.Mock).mockResolvedValue(mockUsers);

    await controller.getUsers(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUsers);
  });

  it("should call next(error) on exception", async () => {
    (UserService.prototype.getUsers as jest.Mock).mockRejectedValue(
      new Error("Failed"),
    );

    await controller.getUsers(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });
});

describe("UserController - getUserById", () => {
  let controller: UserController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    controller = new UserController();
    req = { params: { id: "1" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("should get user by id successfully", async () => {
    const mockUser = { id: "1", name: "John Doe" };
    (UserService.prototype.getUserById as jest.Mock).mockResolvedValue(
      mockUser,
    );

    await controller.getUserById(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUser);
  });

  it("should return 404 if user not found", async () => {
    (UserService.prototype.getUserById as jest.Mock).mockResolvedValue(null);

    await controller.getUserById(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should call next(error) on exception", async () => {
    (UserService.prototype.getUserById as jest.Mock).mockRejectedValue(
      new Error("Failed"),
    );

    await controller.getUserById(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });
});
