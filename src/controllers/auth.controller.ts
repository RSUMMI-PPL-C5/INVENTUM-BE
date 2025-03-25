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
		next: NextFunction
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
			res.status(200).json(user);
		} catch (error) {
			// Check if the error is an instance of AppError
			if (error instanceof AppError) {
				// Handle the custom AppError
				res.status(error.statusCode).json({
				status: "error",
				statusCode: error.statusCode,
				message: error.message,
				});
			} else {
				// Handle general errors (fallback)
				res.status(500).json({
				status: "error",
				statusCode: 500,
				message: "Internal Server Error",
				});
			}
		}
	};

	public verifyToken = (req: Request, res: Response): void => {
		if (!req.user) {
			res.status(401).json({ message: "Token is invalid or missing" });
			return;
		}
		res.status(200).json({ message: "Token is valid", user: req.user });
	};
}

export default AuthController;
