import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";

const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Unauthorized. No user found in token.", 403));
    }

    const userRole = (req.user as any).role; // Assuming the role is included in the token

    if (!roles.includes(userRole)) {
      return next(new AppError("Forbidden. You do not have access.", 403));
    }

    next(); // Proceed to the next middleware if the role is valid
  };
};

export default authorizeRoles;
