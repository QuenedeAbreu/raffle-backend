// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction,RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
// import prisma from '../prisma';

interface JwtPayload {
  id: number;
  isAdmin: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export const authMiddleware: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
     res.status(401).json({ message: 'Token missing' });
  }else{
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
       res.status(401).json({ message: 'Invalid token format' });
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      req.user = decoded;
      next();
    } catch (error) {
       res.status(401).json({ message: 'Invalid token' });
    }
  }
};