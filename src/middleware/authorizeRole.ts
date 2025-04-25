import { Request, Response, NextFunction } from "express";

const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as { role: string };

    if (!user || !roles.includes(user.role)) {
      res
        .status(403)
        .json({ message: "Access Denied. Insufficient permissions." });
      return;
    }

    next();
  };
};

export default authorizeRoles;
