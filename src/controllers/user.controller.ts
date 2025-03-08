import { Request, Response } from 'express';
import UserService from '../services/user.service';

const userService = new UserService();

export const getUsersController = async (req: Request, res: Response) => {
  const users = await userService.getUsers();
  res.status(200).json(users);
};

export const getUserByIdController = async (req: Request, res: Response) => {
  
  
  try {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json(user);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  } 

};