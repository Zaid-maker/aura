/**
 * Next.js 16+ Proxy Configuration
 *
 * This file implements security middleware (now called "proxy" in Next.js 16) that:
 * - Protects API routes with authentication checks
 * - Adds security headers (CSP, X-Frame-Options, etc.)
 * - Detects client IP addresses for rate limiting
 * - Routes requests based on protection requirements
 *
 * Note: In Next.js 16+, this must export a function named "proxy" (not "middleware")
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Define protected routes that require authentication
const protectedRoutes = [
  "/api/posts/create",
  "/api/posts/*/delete",
  "/api/posts/*/like",
  "/api/posts/*/comments",
  "/api/users/*/follow",
  "/api/stories", // POST to create story requires auth, GET is public
  "/api/stories/*", // POST to specific story endpoints requires auth, GET is public
  "/api/notifications", // GET notifications requires auth
  "/api/notifications/*", // POST mark-read requires auth
  "/api/user/profile", // PATCH profile update requires auth
  "/api/user/delete", // DELETE account requires auth
  "/api/admin/users/*/verify", // POST to verify/unverify users requires auth
];

// Define public routes that don't require authentication
const publicRoutes = [
  "/api/auth",
  "/api/uploadthing",
  "/api/search",
  "/api/posts",
];

// Helper function to check if a path matches a pattern
function matchesPattern(path: string, pattern: string): boolean {
  const regex = new RegExp(
    "^" + pattern.replace(/\*/g, "[^/]+").replace(/\//g, "\\/") + "$",
  );
  return regex.test(path);
}

// Helper function to check if route is protected
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((route) => matchesPattern(pathname, route));
}

// Helper function to check if route is public
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => {
    if (route === "/api/posts") {
      // Exact match for /api/posts or /api/posts with query params only
      // This prevents /api/posts/123/like from being treated as public
      return pathname === "/api/posts" || pathname.startsWith("/api/posts?");
    }
    return pathname.startsWith(route);
  });
}

// Get client IP address
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIp) {
    return realIp.trim();
  }

  return "127.0.0.1";
}

/**
 * Apply security headers to a NextResponse
 * Hardens all API responses against common vulnerabilities
 */
function applySecurityHeaders(response: NextResponse): void {
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // XSS Protection
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Referrer Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; frame-ancestors 'none';",
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Only process API routes
  if (!pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Check authentication for protected routes FIRST (before public route check)
  // This prevents routes like /api/posts/123/like from being treated as public
  // Note: GET requests to /api/posts/*/comments and /api/stories/* are public (viewing)
  // but POST requests require authentication (creating)
  const isProtected = isProtectedRoute(pathname);
  const isCommentsGetRequest =
    pathname.match(/\/api\/posts\/[^/]+\/comments$/) && method === "GET";
  const isStoriesGetRequest =
    (pathname === "/api/stories" || pathname.match(/\/api\/stories\/[^/]+$/)) &&
    method === "GET";

  if (isProtected && !isCommentsGetRequest && !isStoriesGetRequest) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 },
      );
    }

    // Add user info to headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", token.sub || "");
    requestHeaders.set("x-user-email", token.email || "");

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // Apply security headers to authenticated responses
    applySecurityHeaders(response);

    return response;
  }

  // Skip middleware for public routes (checked AFTER protected routes)
  if (isPublicRoute(pathname)) {
    const response = NextResponse.next();
    applySecurityHeaders(response);
    return response;
  }

  // Apply security headers to all other API routes
  const response = NextResponse.next();
  applySecurityHeaders(response);

  return response;
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    "/api/:path*",
    // Exclude Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
