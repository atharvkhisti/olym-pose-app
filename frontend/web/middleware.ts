import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.edge";

/**
 * Middleware using Edge-compatible auth configuration.
 * Does not use MongoDB adapter - authorization is handled via JWT only.
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.svg$).*)",
  ],
};
