import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Cleanup expired stories
 * This endpoint can be called by a cron job (e.g., Vercel Cron)
 * to delete stories that have expired (older than 24 hours)
 * 
 * In production, set up a cron job to call this endpoint:
 * - Add to vercel.json:
 *   {
 *     "crons": [{
 *       "path": "/api/stories/cleanup",
 *       "schedule": "0 * * * *"
 *     }]
 *   }
 */
export async function POST(req: NextRequest) {
  try {
    // Optional: Add authorization check for security
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Delete all expired stories
    const result = await prisma.story.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(), // Less than current time = expired
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.count} expired stories`,
      count: result.count,
    });
  } catch (error) {
    console.error("Error cleaning up stories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Also allow GET for manual testing
export async function GET(req: NextRequest) {
  try {
    const expiredCount = await prisma.story.count({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return NextResponse.json({
      expiredStories: expiredCount,
      message: "Use POST to delete expired stories",
    });
  } catch (error) {
    console.error("Error checking expired stories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
