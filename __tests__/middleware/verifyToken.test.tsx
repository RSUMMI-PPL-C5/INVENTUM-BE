import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import verifyToken from '../../api/middleware/verifyToken';
import { RequestIncludesUser } from '../../api/interfaces/user.interface';

jest.mock('jsonwebtoken');

describe('verifyToken Middleware', () => {
  let req: Partial<RequestIncludesUser>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      header: jest.fn().mockReturnValue('Bearer validToken'),
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    next = jest.fn();
  });

  it('should call next() if token is valid', () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: 'userId' });

    verifyToken(req as RequestIncludesUser, res as Response, next);

    expect(jwt.verify).toHaveBeenCalledWith('validToken', expect.any(String));
    expect(req.user).toEqual({ id: 'userId' });
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 if no token is provided', () => {
    req.header = jest.fn().mockReturnValue(undefined);

    verifyToken(req as RequestIncludesUser, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({ message: 'Access Denied. No token provided.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 400 if token is invalid', () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    verifyToken(req as RequestIncludesUser, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: 'Invalid token.' });
    expect(next).not.toHaveBeenCalled();
  });
});