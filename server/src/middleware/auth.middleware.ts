import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/constants';
import { prisma } from '../prisma';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    res.status(401).json({ error: 'Access token missing or invalid' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is invalid or expired' });
    return;
  }
};

export const optionalAuthenticateToken = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
      req.user = decoded;
    } catch {
      // Ignore invalid token on optional auth
    }
  }
  next();
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: User authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Forbidden: Requires one of [${allowedRoles.join(', ')}] role`
      });
      return;
    }

    next();
  };
};

