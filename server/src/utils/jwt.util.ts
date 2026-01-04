import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "change-this-refresh-secret";
const JWT_EXPIRES_IN = "15m"; // Access token expires in 15 minutes
const JWT_REFRESH_EXPIRES_IN = "7d"; // Refresh token expires in 7 days

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
}

export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
};
