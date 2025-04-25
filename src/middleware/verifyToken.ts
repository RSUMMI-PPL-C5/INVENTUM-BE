import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

declare module "express" {
  interface Request {
    user?: JwtPayload | string;
  }
}

const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Access Denied. No token provided." });
      return;
    }

    const secretKey = process.env.JWT_SECRET_KEY;

    if (!secretKey) {
      res.status(500).json({ message: "JWT_SECRET_KEY is not set" });
      return;
    }

    const decoded = jwt.verify(token, secretKey) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Invalid token." });
  }
};

export default verifyToken;
