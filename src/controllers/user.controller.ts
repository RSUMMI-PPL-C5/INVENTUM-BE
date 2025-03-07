import { Request, Response } from "express";
import UserService from "../services/user.service";
import UserRepository from "../repository/user.repository";

const userService = new UserService(new UserRepository());

export const getUsersController = async (req: Request, res: Response) => {
  const users = await userService.getUsers();
  res.status(200).json(users);
};
