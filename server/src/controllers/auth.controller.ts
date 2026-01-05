import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { db } from '../db/connection';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body);

      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({
        success: true,
        data: { user: result.user },
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        success: true,
        data: { user: result.user },
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      });
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          error: 'Refresh token required',
        });
      }

      const result = await authService.refreshAccessToken(refreshToken);

      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });

      return res.json({
        success: true,
        message: 'Token refreshed',
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
      });
    }
  }

  async logout(_: Request, res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  async me(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;

      const [user] = await db.select().from(users).where(eq(users.id, userId));

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      return res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUrl: user.avatarUrl,
            isActive: user.isActive,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
          },
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch user',
      });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { firstName, lastName, avatarUrl } = req.body;

      await db
        .update(users)
        .set({
          firstName,
          lastName,
          avatarUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      const [updatedUser] = await db.select().from(users).where(eq(users.id, userId));

      return res.json({
        success: true,
        data: { user: updatedUser },
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Failed to update profile',
      });
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { currentPassword, newPassword } = req.body;

      const [user] = await db.select().from(users).where(eq(users.id, userId));

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Current password is incorrect',
        });
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      await db
        .update(users)
        .set({
          passwordHash: newPasswordHash,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      return res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Failed to change password',
      });
    }
  }
}
