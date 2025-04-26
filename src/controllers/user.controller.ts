import { Request, Response, NextFunction } from "express";
import UserService from "../services/user.service";
import { UserFilterOptions } from "../interfaces/user.filter.interface";
import { PaginationOptions } from "../interfaces/pagination.interface";
import { AddUserDTO } from "../dto/user.dto";

class UserController {
  private readonly userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public createUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userData: AddUserDTO = {
        ...req.body,
        createdBy: (req.user as any).userId,
      };

      const result = await this.userService.createUser(userData);

      res.status(201).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public getUsers = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 10;

      const paginationOptions: PaginationOptions = {
        page: page > 0 ? page : 1,
        limit: limit > 0 ? limit : 10,
      };

      const filters: UserFilterOptions = req.query;
      const search = req.query.search as string | undefined;

      const result = await this.userService.getUsers(
        search,
        filters,
        paginationOptions,
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = await this.userService.getUserById(req.params.id);

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = (req.user as any).userId;

      const user = await this.userService.updateUser(
        req.params.id,
        req.body,
        userId,
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
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
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
      next(error);
    }
  };
}

export default UserController;
