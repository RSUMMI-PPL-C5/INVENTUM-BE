import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/auth.service';
import AppError from '../utils/appError';

const authService = new AuthService();

export const loginController = async (req: Request, res: Response, next: NextFunction ) => {

    try {
        const {username, password} = req.body

        if (!username || !password) {
            res.status(400).json({ message: "Username and password are required" });
            return;
          }
  
        const users = await authService.login(username, password);
        
        res.status(200).json(users);
      } catch (error) {
        const statusCode = (error as AppError).statusCode || 500;
        const message = (error as AppError).message || "Internal Server erroror";

        res.status(statusCode).json({
            status: "error",
            statusCode,
            message,
        });
      }   
  };

  export const verifyTokenController = (req: Request, res: Response) => {
    res.status(200).json({ message: "Token is valid", user: req.user });
  }