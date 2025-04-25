import { validateRequest } from "../../../src/middleware/validateRequest";
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

jest.mock("express-validator", () => ({
  validationResult: jest.fn(),
}));

describe("validateRequest Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("should call next if there are no validation errors", () => {
    (validationResult as unknown as jest.Mock).mockReturnValue({
      isEmpty: () => true,
    });

    validateRequest(req as Request, res as Response, next);

    expect(validationResult).toHaveBeenCalledWith(req);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it("should return 400 and error message if validation errors exist", () => {
    const mockErrors = [
      { msg: "Invalid input", param: "field", location: "body" },
    ];
    (validationResult as unknown as jest.Mock).mockReturnValue({
      isEmpty: () => false,
      array: () => mockErrors,
    });

    validateRequest(req as Request, res as Response, next);

    expect(validationResult).toHaveBeenCalledWith(req);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      statusCode: 400,
      message: "Invalid input",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
