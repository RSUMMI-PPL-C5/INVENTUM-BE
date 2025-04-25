import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessage = errors.array()[0].msg;
    res.status(400).json({
      status: "error",
      statusCode: 400,
      message: errorMessage,
    });
    return;
  }

  next();
};
