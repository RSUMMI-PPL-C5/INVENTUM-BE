import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { IUserService } from "../services/interface/user.service.interface";
import { hasFilters } from "../filters/user.filter";
import { UserFilterOptions } from "../filters/interface/user.filter.interface";

class UserController {
  private readonly userService: IUserService;

  constructor(userSevice: IUserService) {
    this.userService = userSevice;
  }

  public getUsers = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: "Invalid input data" });
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
}

export default UserController;
