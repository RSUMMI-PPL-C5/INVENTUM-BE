import { Request, Response } from 'express';
import { getUsers, getUserById, updateUser } from '../services/user.service';

export const getUsersController = async (req: Request, res: Response) => {
  const users = getUsers();
  res.status(200).json(users);
};

export const getUserByIdController = async (req: Request, res: Response) => {
  const user = await getUserById(parseInt(req.params.id));
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  res.status(200).json(user);
};

export const updateUserController = async (req: Request, res: Response) => {
  const user = await updateUser(parseInt(req.params.id), req.body);
  if (user === undefined) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  if (user === null) {
    res.status(400).json({ message: 'Invalid data' });
    return;
  }

  res.status(200).json(user);
};