import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { db } from '../db/connection';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken, JWTPayload } from '../utils/jwt.util';

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
        statusCode: 200,
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
      // The user is already attached to the request by the auth middleware
      // and contains the data from the JWT (including workspaceMemberships)
      const user = req.user as any;

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
            id: user.userId,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUrl: user.avatarUrl,
            workspaceMemberships: user.workspaceMemberships || [],
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
      // @ts-ignore
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

      // Fetch fresh user data with membersips to generate new token
      const updatedUser = await db.query.users.findFirst({
         where: eq(users.id, userId),
         with: {
            workspaceMemberships: true
         }
      });

      if (!updatedUser) throw new Error("User not found");

      // Generate items for new token
      const payload: JWTPayload = {
        userId: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        firstName: updatedUser.firstName || undefined,
        lastName: updatedUser.lastName || undefined,
        avatarUrl: updatedUser.avatarUrl || undefined,
        workspaceMemberships: updatedUser.workspaceMemberships.map(m => ({
            workspaceId: m.workspaceId,
            role: m.role
        }))
      };

      const accessToken = generateAccessToken(payload);
      
      // Update cookie
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });

      return res.json({
        success: true,
        data: { 
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                username: updatedUser.username,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                avatarUrl: updatedUser.avatarUrl,
                workspaceMemberships: payload.workspaceMemberships
            } 
        },
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
