import UserController from "../../../../src/controllers/user.controller";
import UserService from "../../../../src/services/user.service";
import { Request, Response, NextFunction } from "express";

jest.mock("../../../../src/services/user.service");

describe("UserController - createUser", () => {
  let controller: UserController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    controller = new UserController();
    req = { body: {}, user: { userId: "123" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("should create user successfully", async () => {
    const mockUser = { id: "1", name: "John Doe" };
    (UserService.prototype.createUser as jest.Mock).mockResolvedValue(mockUser);

    await controller.createUser(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: mockUser,
    });
  });

  it("should call next(error) on exception", async () => {
    (UserService.prototype.createUser as jest.Mock).mockRejectedValue(
      new Error("Failed"),
    );

    await controller.createUser(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });
});
