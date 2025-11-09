import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthAndRateLimit } from "@/lib/api-protection";

/**
 * POST /api/notifications/mark-read
 * Mark notifications as read
 */
export async function POST(req: NextRequest) {
  try {
    const protection = await withAuthAndRateLimit(req, "mutation");
    if (!protection.success) {
      return protection.response;
    }

    const { session, headers } = protection;
    const body = await req.json();
    const { notificationIds, markAll } = body;

    if (markAll) {
      // Mark all notifications as read
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          read: false,
        },
        data: {
          read: true,
        },
      });
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: session.user.id, // Security: ensure user owns these notifications
        },
        data: {
          read: true,
        },
      });
    } else {
      return NextResponse.json(
        { error: "Invalid request: provide notificationIds or markAll" },
        { status: 400, headers },
      );
    }

    return NextResponse.json({ success: true }, { headers });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
