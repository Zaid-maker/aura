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
 *       "schedule": "0 0 * * *"
 *     }]
 *   }
 * 
 * This runs once per day at midnight UTC (compatible with Vercel Hobby plan).
 * Expired stories won't appear in queries due to expiresAt filtering,
 * so daily cleanup is sufficient for database maintenance.
 */
export async function POST(req: NextRequest) {
  try {
    // Authorization check: require either CRON_SECRET or Vercel cron header
    const authHeader = req.headers.get("authorization");
    const vercelCronHeader = req.headers.get("x-vercel-cron");
    const cronSecret = process.env.CRON_SECRET;
    
    // Check if authorized by either method
    const isAuthorizedBySecret = cronSecret && authHeader === `Bearer ${cronSecret}`;
    const isAuthorizedByVercel = vercelCronHeader === "1"; // Exact match to prevent spoofing
    
    if (!isAuthorizedBySecret && !isAuthorizedByVercel) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Delete expired stories in batches to avoid timeouts
    const batchSize = 100;
    const maxIterations = 1000; // Safety limit to prevent infinite loops
    let totalDeleted = 0;
    let iteration = 0;

    while (iteration < maxIterations) {
      // Find expired story IDs in chunks
      const expiredStories = await prisma.story.findMany({
        where: {
          expiresAt: {
            lt: new Date(), // Less than current time = expired
          },
        },
        select: {
          id: true,
        },
        take: batchSize,
      });

      // Break if no more expired stories
      if (expiredStories.length === 0) {
        break;
      }

      // Delete this batch
      const idsToDelete = expiredStories.map((story) => story.id);
      await prisma.story.deleteMany({
        where: {
          id: {
            in: idsToDelete,
          },
        },
      });

      totalDeleted += expiredStories.length;
      iteration++;

      // Break if we got less than batchSize (no more stories to delete)
      if (expiredStories.length < batchSize) {
        break;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Deleted ${totalDeleted} expired stories in ${iteration} batches`,
      count: totalDeleted,
      batches: iteration,
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
