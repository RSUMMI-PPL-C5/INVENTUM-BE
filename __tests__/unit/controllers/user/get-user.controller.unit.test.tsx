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

  it("should use default pagination values when no query params provided", async () => {
    req.query = {};
    const mockUsers = { data: [], total: 0 };
    (UserService.prototype.getUsers as jest.Mock).mockResolvedValue(mockUsers);

    await controller.getUsers(req as Request, res as Response, next);

    expect(UserService.prototype.getUsers).toHaveBeenCalledWith(
      undefined,
      {},
      { page: 1, limit: 10 },
    );
  });

  it("should use provided pagination values", async () => {
    req.query = { page: "2", limit: "20" };
    const mockUsers = { data: [], total: 0 };
    (UserService.prototype.getUsers as jest.Mock).mockResolvedValue(mockUsers);

    await controller.getUsers(req as Request, res as Response, next);

    expect(UserService.prototype.getUsers).toHaveBeenCalledWith(
      undefined,
      { page: "2", limit: "20" },
      { page: 2, limit: 20 },
    );
  });

  it("should use fallback values for negative pagination params", async () => {
    req.query = { page: "-1", limit: "-5" };
    const mockUsers = { data: [], total: 0 };
    (UserService.prototype.getUsers as jest.Mock).mockResolvedValue(mockUsers);

    await controller.getUsers(req as Request, res as Response, next);

    expect(UserService.prototype.getUsers).toHaveBeenCalledWith(
      undefined,
      { page: "-1", limit: "-5" },
      { page: 1, limit: 10 },
    );
  });

  it("should use default values for non-numeric pagination params", async () => {
    req.query = { page: "abc", limit: "xyz" };
    const mockUsers = { data: [], total: 0 };
    (UserService.prototype.getUsers as jest.Mock).mockResolvedValue(mockUsers);

    await controller.getUsers(req as Request, res as Response, next);

    // NaN > 0 is false, so it should use the default values
    expect(UserService.prototype.getUsers).toHaveBeenCalledWith(
      undefined,
      { page: "abc", limit: "xyz" },
      { page: 1, limit: 10 },
    );
  });

  it("should pass search parameter to service", async () => {
    req.query = { search: "john" };
    const mockUsers = { data: [], total: 0 };
    (UserService.prototype.getUsers as jest.Mock).mockResolvedValue(mockUsers);

    await controller.getUsers(req as Request, res as Response, next);

    expect(UserService.prototype.getUsers).toHaveBeenCalledWith(
      "john",
      { search: "john" },
      { page: 1, limit: 10 },
    );
  });

  it("should pass filter parameters to service", async () => {
    req.query = { role: "admin", status: "active" };
    const mockUsers = { data: [], total: 0 };
    (UserService.prototype.getUsers as jest.Mock).mockResolvedValue(mockUsers);

    await controller.getUsers(req as Request, res as Response, next);

    expect(UserService.prototype.getUsers).toHaveBeenCalledWith(
      undefined,
      { role: "admin", status: "active" },
      { page: 1, limit: 10 },
    );
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
