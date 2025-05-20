import { Request, Response, NextFunction } from "express";
import AuthService from "../services/auth.service";
import { Sentry, Severity } from "../../sentry/instrument"; // Add Sentry import

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
        // Track missing credentials
        Sentry.captureMessage(
          `Login attempt with missing credentials`,
          Severity.Warning,
        );

        res.status(400).json({
          status: "error",
          message: "Username and password are required",
        });
        return; // Add return to prevent further execution
      }

      const user = await this.authService.login(username, password);

      // Track successful login
      Sentry.captureMessage(`Successful login: ${username}`, Severity.Info);

      res.status(200).json({
        status: "success",
        data: { user },
      });
    } catch (error) {
      // Track login failure
      Sentry.captureMessage(
        `Failed login attempt: ${req.body.username || "unknown"}`,
        Severity.Warning,
      );

      next(error);
    }
  };

  public verifyToken = (
    req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    try {
      res.status(200).json({
        status: "success",
        data: { user: req.user },
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
