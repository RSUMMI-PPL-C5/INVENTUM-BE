import { Request, Response } from "express";
import UserService from "../services/user.service";
import { UserFilterOptions } from "../filters/interface/user.filter.interface";
import { PaginationOptions } from "../filters/interface/pagination.interface";
import AppError from "../utils/appError";
import { AddUserDTO } from "../dto/user.dto";

class UserController {
	private readonly userService: UserService;

	constructor() {
		this.userService = new UserService();
	}

  public createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData: AddUserDTO = {
        ...req.body,
        createdBy: (req.user as any).userId
      }
      
      const result = await this.userService.createUser(userData)
    
      res.status(201).json({
        status: "success",
        data: result,
      })

    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          status: "error",
          statusCode: error.statusCode,
          message: error.message,
        })
      } else {
        res.status(500).json({
          status: "error",
          statusCode: 500,
          message: (error as any).message,
        })
      }
    }
  }

  public getUsers = async (req: Request, res: Response): Promise<void> => {
      try {
  
        const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
        
        const paginationOptions: PaginationOptions = { 
          page: page > 0 ? page : 1,
          limit: limit > 0 ? limit : 10
        };
  
        const filters: UserFilterOptions = req.query;
        const search = req.query.search as string | undefined;
  
        const result = await this.userService.getUsers(
          search, 
          filters, 
          paginationOptions
        );
      
        res.status(200).json(result);
      } catch (error) {

          if (error instanceof AppError) {
              res.status(error.statusCode).json({
                status: "error",
                statusCode: error.statusCode,
                message: error.message,
              })
          } else {
              res.status(500).json({
                status: "error",
                statusCode: 500,
                message: (error as any).message,
              })
          }
      }
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

			if (error instanceof AppError) {
                res.status(error.statusCode).json({
                  status: "error",
                  statusCode: error.statusCode,
                  message: error.message,
                })
            } else {
                res.status(500).json({
                  status: "error",
                  statusCode: 500,
                  message: (error as any).message,
                })
            }

		}
	};

	public updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req.user as any).userId;
        
        const user = await this.userService.updateUser(
            req.params.id,
            req.body,
            userId
        );

        if (!user) {
            res.status(404).json({
                message: "User not found or invalid data",
            });
            return;
        }
        
        res.status(201).json({
          status: "success",
          data: user,
        })
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                status: "error",
                statusCode: error.statusCode,
                message: error.message,
            });
        } else {
            res.status(500).json({
                status: "error",
                statusCode: 500,
                message: (error as Error).message,
            });
        }
    }
  };

	public deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.id;
        const deletedBy = (req.user as any).userId;
        
        const user = await this.userService.deleteUser(userId, deletedBy);
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

