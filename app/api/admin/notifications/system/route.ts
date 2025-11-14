import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthAndRateLimit } from "@/lib/api-protection";

/**
 * POST /api/admin/notifications/system
 * Send system-wide notifications (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    // Apply authentication and rate limiting
    const protection = await withAuthAndRateLimit(req, "mutation");
    if (!protection.success) {
      return protection.response;
    }

    const { session, headers } = protection;

    // Check if session exists and has user
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Authentication required." },
        { status: 401, headers },
      );
    }

    // Only admins can send system notifications
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          error:
            "Forbidden. Only administrators can send system notifications.",
        },
        { status: 403, headers },
      );
    }

    const body = await req.json();
    const { message, targetType = "all", targetUserIds = [] } = body;

    // Validate message
    if (!message || typeof message !== "string" || message.trim() === "") {
      return NextResponse.json(
        { error: "Message is required and must be a non-empty string" },
        { status: 400, headers },
      );
    }

    if (message.length > 500) {
      return NextResponse.json(
        { error: "Message must be 500 characters or less" },
        { status: 400, headers },
      );
    }

    // Validate target type
    if (!["all", "specific"].includes(targetType)) {
      return NextResponse.json(
        { error: "Target type must be 'all' or 'specific'" },
        { status: 400, headers },
      );
    }

    // If specific users, validate the IDs
    if (targetType === "specific") {
      if (!Array.isArray(targetUserIds) || targetUserIds.length === 0) {
        return NextResponse.json(
          {
            error:
              "Target user IDs must be a non-empty array when target type is 'specific'",
          },
          { status: 400, headers },
        );
      }
    }

    let recipientIds: string[] = [];

    if (targetType === "all") {
      // Get all user IDs
      const users = await prisma.user.findMany({
        select: { id: true },
      });
      recipientIds = users.map((u) => u.id);
    } else {
      recipientIds = targetUserIds;
    }

    // Create notifications for all recipients
    const notifications = recipientIds.map((userId) => ({
      type: "SYSTEM" as const,
      message: message.trim(),
      userId,
      actorId: null, // System notifications don't have an actor
      read: false,
    }));

    // Batch create notifications
    const result = await prisma.notification.createMany({
      data: notifications,
    });

    return NextResponse.json(
      {
        success: true,
        message: "System notification sent successfully",
        recipientCount: result.count,
      },
      { headers },
    );
  } catch (error) {
    console.error("Error sending system notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
