import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { cookies } from "next/headers";
import { TOKEN_NAMES } from "./constants";

const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "";
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  console.warn("⚠️ JWT secrets not configured. Authentication will not work.");
}

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface DecodedToken extends TokenPayload, JwtPayload {}

/**
 * Generate access token
 */
export function generateAccessToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  };
  return jwt.sign(payload, JWT_REFRESH_SECRET, options);
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as DecodedToken;
  } catch {
    return null;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as DecodedToken;
  } catch {
    return null;
  }
}

/**
 * Set auth cookies
 */
export async function setAuthCookies(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  const cookieStore = await cookies();

  // Access token - short lived
  cookieStore.set(TOKEN_NAMES.ACCESS, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60, // 15 minutes
  });

  // Refresh token - long lived
  cookieStore.set(TOKEN_NAMES.REFRESH, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

/**
 * Clear auth cookies
 */
export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(TOKEN_NAMES.ACCESS);
  cookieStore.delete(TOKEN_NAMES.REFRESH);
}

/**
 * Get tokens from cookies
 */
export async function getTokensFromCookies(): Promise<{
  accessToken: string | undefined;
  refreshToken: string | undefined;
}> {
  const cookieStore = await cookies();

  return {
    accessToken: cookieStore.get(TOKEN_NAMES.ACCESS)?.value,
    refreshToken: cookieStore.get(TOKEN_NAMES.REFRESH)?.value,
  };
}

/**
 * Get current user from access token
 */
export async function getCurrentUser(): Promise<DecodedToken | null> {
  const { accessToken } = await getTokensFromCookies();

  if (!accessToken) {
    return null;
  }

  return verifyAccessToken(accessToken);
}
