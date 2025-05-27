import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import { createVerifier } from "fast-jwt";

declare module "express" {
  interface Request {
    user?: JwtPayload | string;
  }
}

const secretKey = process.env.JWT_SECRET_KEY ?? "";
const verifyToken = createVerifier({ key: secretKey });

export default (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Access Denied" });
      return;
    }

    req.user = verifyToken(token);
    next();
  } catch (error) {
    console.error("Token verification error:", error);

    if (error instanceof Error) {
      if (error.name === "TokenExpiredError") {
        res.status(401).json({ message: "Token expired" });
      } else if (error.message.includes("signature")) {
        res.status(401).json({ message: "Invalid token signature" });
      } else {
        res.status(401).json({ message: `Invalid token: ${error.message}` });
      }
    } else {
      res.status(400).json({ message: "Authentication failed" });
    }
  }
};
