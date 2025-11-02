import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Session } from "next-auth";
import {
  generalRatelimit,
  authRatelimit,
  mutationRatelimit,
  sensitiveRatelimit,
} from "./rate-limit";

// Type definitions for protection results
type RateLimitHeaders = {
  "X-RateLimit-Limit": string;
  "X-RateLimit-Remaining": string;
  "X-RateLimit-Reset": string;
};

type RateLimitSuccessResult = {
  success: true;
  headers: RateLimitHeaders;
};

type RateLimitFailureResult = {
  success: false;
  response: NextResponse;
};

type RateLimitResult = RateLimitSuccessResult | RateLimitFailureResult;

type AuthSuccessResult = {
  success: true;
  session: Session;
};

type AuthFailureResult = {
  success: false;
  response: NextResponse;
};

type AuthResult = AuthSuccessResult | AuthFailureResult;

type AuthAndRateLimitSuccessResult = {
  success: true;
  session: Session;
  headers: RateLimitHeaders;
};

type AuthAndRateLimitFailureResult = {
  success: false;
  response: NextResponse;
};

export type AuthAndRateLimitResult =
  | AuthAndRateLimitSuccessResult
  | AuthAndRateLimitFailureResult;

// Get client identifier (IP or user ID)
export function getClientIdentifier(
  request: NextRequest,
  userId?: string,
): string {
  if (userId) {
    return `user:${userId}`;
  }

  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0].trim() || realIp || "127.0.0.1";

  return `ip:${ip}`;
}

// Rate limit types
export type RateLimitType = "general" | "auth" | "mutation" | "sensitive";

// Apply rate limiting to an API route
export async function withRateLimit(
  request: NextRequest,
  type: RateLimitType = "general",
  customIdentifier?: string,
): Promise<RateLimitResult> {
  // Select the appropriate rate limiter
  const ratelimiters = {
    general: generalRatelimit,
    auth: authRatelimit,
    mutation: mutationRatelimit,
    sensitive: sensitiveRatelimit,
  };

  const ratelimit = ratelimiters[type];

  // Get identifier
  const identifier = customIdentifier || getClientIdentifier(request);

  // Check rate limit
  const { success, limit, remaining, reset, pending } =
    await ratelimit.limit(identifier);

  // Wait for analytics if enabled
  if (pending) {
    await pending;
  }

  // Create response with rate limit headers
  const headers = {
    "X-RateLimit-Limit": limit.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": reset.toString(),
  };

  if (!success) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: "Too many requests",
          message: `Rate limit exceeded. Try again in ${Math.ceil((reset - Date.now()) / 1000)} seconds.`,
          limit,
          remaining: 0,
          reset,
        },
        { status: 429, headers },
      ),
    };
  }

  return {
    success: true,
    headers,
  };
}

// Verify authentication for protected routes
export async function withAuth(request: NextRequest): Promise<AuthResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Unauthorized - Please sign in to continue" },
        { status: 401 },
      ),
    };
  }

  return {
    success: true,
    session,
  };
}

// Combined authentication and rate limiting
export async function withAuthAndRateLimit(
  request: NextRequest,
  type: RateLimitType = "mutation",
): Promise<AuthAndRateLimitResult> {
  // Check authentication first
  const authResult = await withAuth(request);
  if (!authResult.success) {
    return authResult;
  }

  // Then apply rate limiting using user ID
  const userId = authResult.session?.user?.email || undefined;
  const rateLimitResult = await withRateLimit(
    request,
    type,
    userId ? `user:${userId}` : undefined,
  );

  if (!rateLimitResult.success) {
    return rateLimitResult;
  }

  return {
    success: true,
    session: authResult.session,
    headers: rateLimitResult.headers,
  };
}

// Input validation helper
export function validateInput<T>(
  data: any,
  schema: { [K in keyof T]: (value: any) => boolean },
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [key, validator] of Object.entries(schema)) {
    if (typeof validator === "function" && !validator(data[key])) {
      errors.push(`Invalid ${key}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Sanitize string input (prevent XSS)
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove < and >
    .substring(0, 5000); // Limit length
}

// Validate HTTP method
export function validateMethod(request: NextRequest, allowedMethods: string[]) {
  if (!allowedMethods.includes(request.method)) {
    return {
      success: false,
      response: NextResponse.json(
        { error: `Method ${request.method} not allowed` },
        { status: 405, headers: { Allow: allowedMethods.join(", ") } },
      ),
    };
  }

  return { success: true };
}
