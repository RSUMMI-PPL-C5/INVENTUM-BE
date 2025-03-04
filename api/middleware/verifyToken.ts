import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RequestIncludesUser } from '../interfaces/user.interface';

const verifyToken = (req: RequestIncludesUser, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).send({ message: 'Access Denied. No token provided.' });
  }

  const secretKey = process.env.JWT_SECRET_KEY;
  if (!secretKey) {
    throw new Error('JWT_SECRET_KEY is not set');
  }

  try {
    const verified = jwt.verify(token, secretKey);
    req.user = verified;
    next();
  } catch {
    res.status(400).send({ message: 'Invalid token.' });
  }
};

export default verifyToken;