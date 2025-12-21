import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.edge";

/**
 * Full NextAuth configuration.
 * MongoDB adapter is disabled - using JWT strategy for session management.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  // Use env var for base URL
  basePath: "/api/auth",
  // Enable debug in development
  debug: process.env.NODE_ENV === "development",
  events: {
    async signIn({ user, account }) {
      console.log(`✅ User signed in: ${user.email} via ${account?.provider}`);
    },
    async signOut(message) {
      console.log(`👋 User signed out`);
    },
  },
});
