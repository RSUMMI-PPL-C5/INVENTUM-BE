import { Request } from 'express';

export interface RequestIncludesUser extends Request {
  user?: string | object;
}

export interface IUser {
    id: string;
    email: string;
    username: string;
    password: string;
    role: string;
  }
  
