import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';
import User from '../models/User';

interface JwtPayload {
  id: string;
  role: string;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  const user = await User.findById(decoded.id).select('+password');

  if (!user || !user.isActive) {
    res.status(401).json({ success: false, message: 'User not found or deactivated' });
    return;
  }

  req.user = user;
  next();
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Admin access required' });
    return;
  }
  next();
};
