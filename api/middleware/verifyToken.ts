import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RequestIncludesUser } from '../interfaces/user.interface';

const verifyToken = (req: RequestIncludesUser, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).send({ message: 'Access Denied. No token provided.' });
  }

  try {
    const secretKey = process.env.JWT_SECRET_KEY ?? 'defaultSecretKey';
    const verified = jwt.verify(token, secretKey);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send({ message: 'Invalid token.' });
  }
};

export default verifyToken;