import { Request, Response } from "express";
import UserService from "../services/user.service";

// Default instance for regular use
const defaultUserService = new UserService();

export const searchUser =
  (userService: UserService = defaultUserService) =>
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name } = req.query;
      if (!name || typeof name !== "string") {
        res.status(400).json({ message: "Invalid name query" });
        return;
      }
      const users = await userService.searchUser(name);
      res.status(200).json(users);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "An unknown error occurred" });
      }
    }
  };

const userController = {
  searchUser: searchUser(),
};

export default userController;
