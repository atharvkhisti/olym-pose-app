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
     * - api/auth routes (NextAuth)
     * - api/health (health checks)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public assets
     */
    "/((?!api/auth|api/health|_next/static|_next/image|favicon|sitemap|robots|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
