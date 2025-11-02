import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Validate and create Redis instance - fail fast if credentials are missing
function getRedisInstance(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Missing Upstash Redis credentials. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables. " +
        "Get your credentials from: https://console.upstash.com/",
    );
  }

  return Redis.fromEnv();
}

// Single shared Redis instance used by all rate limiters
const redis = getRedisInstance();

// Create a rate limiter that allows 10 requests per 10 seconds for general API routes
export const generalRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  prefix: "@upstash/ratelimit",
  analytics: true,
});

// Stricter rate limit for authentication routes (3 attempts per minute)
export const authRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "60 s"),
  prefix: "@upstash/ratelimit:auth",
  analytics: true,
});

// Rate limit for mutations (create, update, delete) - 20 requests per minute
export const mutationRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "60 s"),
  prefix: "@upstash/ratelimit:mutation",
  analytics: true,
});

// Very strict rate limit for sensitive operations like account deletion
export const sensitiveRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(2, "300 s"), // 2 requests per 5 minutes
  prefix: "@upstash/ratelimit:sensitive",
  analytics: true,
});
