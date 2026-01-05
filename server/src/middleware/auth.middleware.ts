import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.util';
import jwt from 'jsonwebtoken';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from HttpOnly cookie
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    // Verify token
    const payload = verifyAccessToken(accessToken);

    // Attach user to request
    // @ts-ignore
    req.user = {
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }
};
