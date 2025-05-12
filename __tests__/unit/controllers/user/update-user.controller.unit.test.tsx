import UserController from "../../../../src/controllers/user.controller";
import UserService from "../../../../src/services/user.service";
import { Request, Response, NextFunction } from "express";

jest.mock("../../../../src/services/user.service");

describe("UserController - updateUser", () => {
  let controller: UserController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    controller = new UserController();
    req = { params: { id: "1" }, body: {}, user: { userId: "123" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("should update user successfully", async () => {
    const mockUpdatedUser = { id: "1", name: "Updated John" };
    (UserService.prototype.updateUser as jest.Mock).mockResolvedValue(
      mockUpdatedUser,
    );

    await controller.updateUser(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: mockUpdatedUser,
    });
  });

  it("should return 404 if user not found", async () => {
    (UserService.prototype.updateUser as jest.Mock).mockResolvedValue(null);

    await controller.updateUser(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "User not found or invalid data",
    });
  });

  it("should call next(error) on exception", async () => {
    (UserService.prototype.updateUser as jest.Mock).mockRejectedValue(
      new Error("Failed"),
    );

    await controller.updateUser(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });
});
