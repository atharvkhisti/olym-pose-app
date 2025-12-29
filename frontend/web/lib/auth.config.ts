import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/lib/auth.edge";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

/**
 * Full NextAuth configuration for Node.js runtime.
 * Includes Credentials provider that requires MongoDB (not Edge-compatible).
 * MongoDB adapter is disabled - using JWT strategy for session management.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectDB();
          const user = await User.findOne({ email: credentials.email }).select("+password");

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  // Use env var for base URL
  basePath: "/api/auth",
  // Enable debug in development
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      // For Google OAuth, automatically create user in database if they don't exist
      if (account?.provider === "google" && user.email) {
        try {
          await connectDB();
          
          // Check if user already exists
          let dbUser = await User.findOne({ email: user.email });
          
          // If user doesn't exist, create them
          if (!dbUser) {
            dbUser = await User.create({
              email: user.email,
              name: user.name || user.email.split("@")[0],
              password: await bcrypt.hash(Math.random().toString(36), 10), // Random password for OAuth users
            });
            console.log(`✅ New Google user created: ${user.email}`);
          }
          
          // Update user ID to MongoDB ID
          user.id = dbUser._id.toString();
        } catch (error) {
          console.error("Error creating Google user:", error);
          return false; // Prevent sign-in if user creation fails
        }
      }
      
      return true;
    },
  },
  events: {
    async signIn({ user, account }) {
      console.log(`✅ User signed in: ${user.email} via ${account?.provider}`);
    },
    async signOut(message) {
      console.log(`👋 User signed out`);
    },
  },
});
