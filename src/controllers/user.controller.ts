import { Request, Response } from 'express';
import UserService from '../services/user.service';
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
    }
  };
}

export default UserController;