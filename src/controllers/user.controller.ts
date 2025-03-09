import { Request, Response } from 'express';
import UserService from '../services/user.service';
import UserRepository from '../repository/user.repository';

class UserController {
  private readonly userService: UserService;

  constructor() {
    const userRepository = new UserRepository();
    this.userService = new UserService(userRepository);
  }

  public getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userService.getUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };

  public getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.userService.getUserById(req.params.id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };

  public updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.userService.updateUser(req.params.id, req.body);
      if (!user) {
        res.status(404).json({ message: 'User not found or invalid data' });
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
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };
}

export default UserController;