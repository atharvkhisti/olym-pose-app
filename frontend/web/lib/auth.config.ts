import NextAuth from "next-auth";
// import { MongoDBAdapter } from "@auth/mongodb-adapter";
// import clientPromise from "@/lib/mongodb";
import { authConfig } from "@/lib/auth.edge";

/**
 * Full NextAuth configuration.
 * MongoDB adapter is temporarily disabled due to connection issues.
 * TODO: Re-enable MongoDB adapter once Atlas connection is fixed:
 *   1. Go to MongoDB Atlas → Network Access → Add current IP
 *   2. Or set "Allow Access from Anywhere" (0.0.0.0/0) for dev
 *   3. Ensure cluster is not paused (free tier pauses after inactivity)
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  // adapter: MongoDBAdapter(clientPromise), // Disabled - MongoDB timeout
  events: {
    async signIn({ user, account }) {
      console.log(`✅ User signed in: ${user.email} via ${account?.provider}`);
    },
  },
  debug: process.env.NODE_ENV === "development",
});
