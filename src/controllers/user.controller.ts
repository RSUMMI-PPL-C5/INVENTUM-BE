import { Request, Response } from "express";
import UserService from "../services/user.service";
import UserRepository from "../repository/user.repository"; // Add this import
import { AddUserDTO } from "../dto/user.dto";
import { validationResult } from "express-validator";

class UserController {
	private readonly userService: UserService;

	constructor() {
		// Create a UserRepository instance and pass it to UserService
		const userRepository = new UserRepository();
		this.userService = new UserService(userRepository);
	}

	public addUser = async (req: Request, res: Response): Promise<void> => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				res.status(400).json({ errors: errors.array() });
				return;
			}

			const userData: AddUserDTO = {
				email: req.body.email,
				username: req.body.username,
				password: req.body.password,
				role: req.body.role,
				fullname: req.body.fullname,
				nokar: req.body.nokar,
				divisiId:
					req.body.divisiId !== undefined
						? Number(req.body.divisiId)
						: undefined,
				waNumber: req.body.waNumber,
				createdBy: req.body.userId || 1,
			};

			const newUser = await this.userService.addUser(userData);
			res.status(201).json(newUser);
		} catch (error: unknown) {
			console.error("Error in addUser controller:", error);
			res.status(
				error instanceof Error &&
					(error.message === "Email already in use" ||
						error.message === "Username already in use")
					? 409
					: 500
			).json({
				error:
					error instanceof Error
						? error.message
						: "An unknown error occurred",
			});
		}
	};
}

export default UserController;