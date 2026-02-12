import bcrypt from "bcryptjs";
import { db } from "../db/connection";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import {
  generateAccessToken,
  generateRefreshToken,
  JWTPayload,
  verifyRefreshToken,
} from "../utils/jwt.util";

export class AuthService {
  async register(data: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create user
    const [user] = await db
      .insert(users)
      .values({
        email: data.email,
        username: data.username,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
      })
      .$returningId();

    // Fetch created user with memberships (likely empty, but good practice)
    const createdUser = await db.query.users.findFirst({
      where: eq(users.id, user.id),
      with: {
        workspaceMemberships: true,
      },
    });

    if (!createdUser) throw new Error("User creation failed");

    // Generate tokens
    const payload: JWTPayload = {
      userId: createdUser.id,
      email: createdUser.email,
      username: createdUser.username,
      firstName: createdUser.firstName || undefined,
      lastName: createdUser.lastName || undefined,
      avatarUrl: createdUser.avatarUrl || undefined,
      workspaceMemberships: createdUser.workspaceMemberships.map((m) => ({
        workspaceId: m.workspaceId,
        role: m.role,
      })),
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user: {
        id: createdUser.id,
        email: createdUser.email,
        username: createdUser.username,
        firstName: createdUser.firstName || "",
        lastName: createdUser.lastName || "",
        avatarUrl: createdUser.avatarUrl || undefined,
        workspaceMemberships: payload.workspaceMemberships,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string) {
    // Find user with memberships
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
      with: {
        workspaceMemberships: true,
      },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    // Update last login
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    // Generate tokens
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      avatarUrl: user.avatarUrl || undefined,
      workspaceMemberships: user.workspaceMemberships.map((m) => ({
        workspaceId: m.workspaceId,
        role: m.role,
      })),
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        avatarUrl: user.avatarUrl || undefined,
        workspaceMemberships: payload.workspaceMemberships,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);

    // Verify user still exists and fetch fresh data
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
      with: {
        workspaceMemberships: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Generate new access token with fresh data
    const newPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      avatarUrl: user.avatarUrl || undefined,
      workspaceMemberships: user.workspaceMemberships.map((m) => ({
        workspaceId: m.workspaceId,
        role: m.role,
      })),
    };

    const accessToken = generateAccessToken(newPayload);

    return { accessToken };
  }
}
