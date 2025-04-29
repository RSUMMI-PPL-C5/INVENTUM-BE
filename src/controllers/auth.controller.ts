import { Request, Response, NextFunction } from "express";
import AuthService from "../services/auth.service";

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
          status: "error",
          message: "Username and password are required",
        });
      }

      const user = await this.authService.login(username, password);

      res.status(200).json({
        status: "success",
        data: { user },
      });
    } catch (error) {
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
