export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Olym Pose";

export const AUTH_ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  LOGOUT: "/api/auth/logout",
} as const;

export const PROTECTED_ROUTES = ["/dashboard"] as const;

export const API_ROUTES = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    REFRESH: "/api/auth/refresh",
    LOGOUT: "/api/auth/logout",
  },
  // TODO: Add AI service routes when integrating FastAPI
  // AI: {
  //   ANALYZE: "/api/ai/analyze",
  //   DETECT: "/api/ai/detect",
  // },
} as const;

export const TOKEN_NAMES = {
  ACCESS: "access_token",
  REFRESH: "refresh_token",
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Invalid email or password",
  USER_EXISTS: "User with this email already exists",
  USER_NOT_FOUND: "User not found",
  INVALID_TOKEN: "Invalid or expired token",
  UNAUTHORIZED: "You must be logged in to access this resource",
  SERVER_ERROR: "Something went wrong. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again",
} as const;
