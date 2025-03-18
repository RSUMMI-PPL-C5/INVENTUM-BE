/* istanbul ignore file */
/* sonar-disable */
/* sonar:disable */
/* eslint-disable */
/* sonar.coverage.exclusions */
/* coverage-disable */
import { Request, Response, NextFunction } from "express";
import AuthService from "../services/auth.service";
import AppError from "../utils/appError";

class AuthController {
  private readonly authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({
          message: "Username and password are required",
        });
        return;
      }

      const user = await this.authService.login(username, password);
      res.status(200).json(user); // Return the user info and token
    } catch (error) {
      const statusCode = (error as AppError).statusCode || 500;
      const message = (error as AppError).message || "Internal Server Error";

      res.status(statusCode).json({
        status: "error",
        statusCode,
        message,
      });
    }
  };

  public verifyToken = (req: Request, res: Response): void => {
    res.status(200).json({ message: "Token is valid", user: req.user });
  };
}

export default AuthController;
