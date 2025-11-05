import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthAndRateLimit } from "@/lib/api-protection";

/**
 * GET /api/notifications
 * Fetch user's notifications
 */
export async function GET(req: NextRequest) {
  try {
    const protection = await withAuthAndRateLimit(req, "general");
    if (!protection.success) {
      return protection.response;
    }

    const { session, headers } = protection;
    const { searchParams } = req.nextUrl;
    
    // Pagination
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);
    const cursor = searchParams.get("cursor");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        ...(unreadOnly && { read: false }),
      },
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    });

    const hasMore = notifications.length > limit;
    const notificationsToReturn = hasMore ? notifications.slice(0, limit) : notifications;
    const nextCursor = hasMore ? notificationsToReturn[notificationsToReturn.length - 1].id : undefined;

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        read: false,
      },
    });

    return NextResponse.json(
      {
        notifications: notificationsToReturn,
        nextCursor,
        unreadCount,
      },
      { headers }
    );
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
