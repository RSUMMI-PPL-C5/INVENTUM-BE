import AuthController from "../../../../src/controllers/auth.controller";
import AuthService from "../../../../src/services/auth.service";
import { Request, Response, NextFunction } from "express";

jest.mock("../../../../src/services/auth.service");

describe("AuthController - login", () => {
  let controller: AuthController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    controller = new AuthController();
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    // Reset mocks between tests
    jest.clearAllMocks();
  });

  it("should return 400 if username or password missing (both empty)", async () => {
    req.body = { username: "", password: "" };

    await controller.login(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Username and password are required",
    });
  });

  it("should return 400 if username is missing", async () => {
    req.body = { username: "", password: "password" };

    await controller.login(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Username and password are required",
    });
  });

  it("should return 400 if password is missing", async () => {
    req.body = { username: "testuser", password: "" };

    await controller.login(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Username and password are required",
    });
  });

  it("should login successfully", async () => {
    const mockUser = { id: "user123", username: "testuser" };
    (AuthService.prototype.login as jest.Mock).mockResolvedValue(mockUser);

    req.body = { username: "testuser", password: "password" };

    await controller.login(req as Request, res as Response, next);

    expect(AuthService.prototype.login).toHaveBeenCalledWith(
      "testuser",
      "password",
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: { user: mockUser },
    });
  });

  it("should call next(error) if login throws error", async () => {
    const error = new Error("Login failed");
    (AuthService.prototype.login as jest.Mock).mockRejectedValue(error);

    req.body = { username: "testuser", password: "password" };

    await controller.login(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe("AuthController - verifyToken", () => {
  let controller: AuthController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    controller = new AuthController();
    req = { user: { id: "user123", username: "testuser" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("should return user data successfully", () => {
    controller.verifyToken(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: { user: req.user },
    });
  });

  it("should call next(error) if an error occurs", () => {
    const error = new Error("Verification failed");
    res.json = jest.fn().mockImplementation(() => {
      throw error;
    });

    controller.verifyToken(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
