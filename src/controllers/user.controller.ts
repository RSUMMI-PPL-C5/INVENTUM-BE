<<<<<<< HEAD
import { Request, Response } from "express";
import UserService from "../services/user.service";

// Default instance for regular use
const defaultUserService = new UserService();

export const searchUser =
  (userService: UserService = defaultUserService) =>
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { search } = req.query;
      if (!search || typeof search !== "string") {
        res.status(400).json({ message: "Invalid search query" });
        return;
      }
      const users = await userService.searchUser(search);
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
=======
import { Request, Response } from 'express';
import UserService from '../services/user.service';
<<<<<<< HEAD
import { AddUserDTO } from '../dto/user.dto';
import { validationResult } from 'express-validator';

class UserController {
  private readonly userService: UserService;
  
  constructor() {
    this.userService = new UserService();
  }
  
  public addUser = async (req: Request, res: Response): Promise<void> => {
    try {

      console.log('Request body:', req.body);
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
        divisiId: req.body.divisiId !== undefined ? Number(req.body.divisiId) : undefined,
        waNumber: req.body.waNumber,
        createdBy: req.body.userId || 1 // Default to 1 if not provided
      };
      
      const newUser = await this.userService.addUser(userData);
      res.status(201).json(newUser);
    } catch (error: unknown) {
      // Type guard for Error objects

      console.error('Error in addUser controller:', error);
      if (error instanceof Error) {
        if (error.message === 'Email already in use' || error.message === 'Username already in use') {
          res.status(409).json({ error: error.message });
        } else {
          res.status(500).json({ error: error.message });
        }
      } else {
        // Fallback for non-Error objects
        res.status(500).json({ error: 'An unknown error occurred' });
      }
=======
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
>>>>>>> staging
    }
  };
}

<<<<<<< HEAD
export default UserController;
=======
export default UserController;
>>>>>>> staging
>>>>>>> staging
