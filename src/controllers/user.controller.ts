import { Request, Response } from 'express';
import UserService from '../services/user.service';

const userService = new UserService();

export const getUsersController = async (req: Request, res: Response) => {
  const users = await userService.getUsers();
  res.status(200).json(users);
};