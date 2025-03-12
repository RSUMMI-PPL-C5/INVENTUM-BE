import { Request, Response } from "express";
import UserService from "../services/user.service";
import { AddUserDTO } from "../dto/user.dto";
import { validationResult } from "express-validator";
import { hasFilters } from "../filters/user.filter";
import { UserFilterOptions } from "../filters/interface/user.filter.interface";

class UserController {
	private readonly userService: UserService;

	constructor() {
		this.userService = new UserService();
	}

	// public searchUser = async (req: Request, res: Response): Promise<void> => {
	// 	try {
	// 		const { search } = req.query;

	// 		if (!search || typeof search !== "string") {
	// 			res.status(400).json({ message: "Invalid search query" });
	// 			return;
	// 		}

	// 		const users = await this.userService.searchUser(search);

	// 		res.status(200).json(users);
	// 	} catch (error: unknown) {
	// 		res.status(500).json({
	// 			message:
	// 				(error as Error).message || "An unknown error occurred",
	// 		});
	// 	}
	// };

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

    public getUsers = async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.status(400).json({ error: "Invalid input data" });
          return;
        }

        const { search } = req.query;

        if (search && typeof search === "string") {

            const users = await this.userService.searchUser(search);
            res.status(200).json(users);
            return;
        }

        let users;
        if (hasFilters(req.query)) {
          const filters: UserFilterOptions = {
            role: req.query.role as any,
            divisiId: req.query.divisiId as any,
            createdOnStart: req.query.createdOnStart as any,
            createdOnEnd: req.query.createdOnEnd as any,
            modifiedOnStart: req.query.modifiedOnStart as any,
            modifiedOnEnd: req.query.modifiedOnEnd as any,
          };
          users = await this.userService.getFilteredUsers(filters);
        } else {
          users = await this.userService.getUsers();
        }
    
        res.status(200).json(users);
      };

	public getUserById = async (req: Request, res: Response): Promise<void> => {
		try {
			const user = await this.userService.getUserById(req.params.id);
			if (!user) {
				res.status(404).json({ message: "User not found" });
				return;
			}
			res.status(200).json(user);
		} catch (error) {
			res.status(500).json({ message: (error as Error).message });
		}
	};

	public updateUser = async (req: Request, res: Response): Promise<void> => {
		try {
			const user = await this.userService.updateUser(
				req.params.id,
				req.body
			);
			if (!user) {
				res.status(404).json({
					message: "User not found or invalid data",
				});
				return;
			}
			res.status(200).json(user);
		} catch (error) {
			res.status(500).json({ message: (error as Error).message });
		}
	};

	public deleteUser = async (req: Request, res: Response): Promise<void> => {
		try {
			const user = await this.userService.deleteUser(req.params.id);
			if (!user) {
				res.status(404).json({ message: "User not found" });
				return;
			}
			res.status(200).json({ message: "User deleted successfully" });
		} catch (error) {
			res.status(500).json({ message: (error as Error).message });
		}
	};
}

export default UserController;
