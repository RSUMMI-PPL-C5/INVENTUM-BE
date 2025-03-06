import { Request,Response, NextFunction } from 'express';


const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).send({ message: 'Access Denied. No token provided.' });
    }

    const secretKey = process.env.JWT_SECRET_KEY;
    if (!secretKey) {
        throw new Error('JWT_SECRET_KEY is not set');
    }

    next();
  } catch {
    res.status(400).send({ message: 'Invalid token.' });
  }
};

export default verifyToken;