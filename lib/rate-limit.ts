import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a rate limiter that allows 10 requests per 10 seconds for general API routes
export const generalRatelimit = new Ratelimit({
  redis: process.env.UPSTASH_REDIS_REST_URL
    ? Redis.fromEnv()
    : // Fallback to in-memory storage for development without Redis
      new Map() as any,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  prefix: "@upstash/ratelimit",
  analytics: true,
});

// Stricter rate limit for authentication routes (3 attempts per minute)
export const authRatelimit = new Ratelimit({
  redis: process.env.UPSTASH_REDIS_REST_URL
    ? Redis.fromEnv()
    : new Map() as any,
  limiter: Ratelimit.slidingWindow(3, "60 s"),
  prefix: "@upstash/ratelimit:auth",
  analytics: true,
});

// Rate limit for mutations (create, update, delete) - 20 requests per minute
export const mutationRatelimit = new Ratelimit({
  redis: process.env.UPSTASH_REDIS_REST_URL
    ? Redis.fromEnv()
    : new Map() as any,
  limiter: Ratelimit.slidingWindow(20, "60 s"),
  prefix: "@upstash/ratelimit:mutation",
  analytics: true,
});

// Very strict rate limit for sensitive operations like account deletion
export const sensitiveRatelimit = new Ratelimit({
  redis: process.env.UPSTASH_REDIS_REST_URL
    ? Redis.fromEnv()
    : new Map() as any,
  limiter: Ratelimit.slidingWindow(2, "300 s"), // 2 requests per 5 minutes
  prefix: "@upstash/ratelimit:sensitive",
  analytics: true,
});
