import UserController from "../../../../src/controllers/user.controller";
import UserService from "../../../../src/services/user.service";
import { Request, Response, NextFunction } from "express";

jest.mock("../../../../src/services/user.service");

describe("UserController - deleteUser", () => {
  let controller: UserController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    controller = new UserController();
    req = { params: { id: "1" }, user: { userId: "123" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("should delete user successfully", async () => {
    (UserService.prototype.deleteUser as jest.Mock).mockResolvedValue(true);

    await controller.deleteUser(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "User deleted successfully",
    });
  });

  it("should return 404 if user not found", async () => {
    (UserService.prototype.deleteUser as jest.Mock).mockResolvedValue(false);

    await controller.deleteUser(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should call next(error) on exception", async () => {
    (UserService.prototype.deleteUser as jest.Mock).mockRejectedValue(
      new Error("Failed"),
    );

    await controller.deleteUser(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });
});
