import { prisma } from "@/lib/prisma";

export type NotificationType = "LIKE" | "COMMENT" | "FOLLOW" | "MENTION" | "STORY_VIEW";

interface CreateNotificationParams {
  type: NotificationType;
  userId: string; // Recipient
  actorId: string; // Person who triggered the notification
  message: string;
  postId?: string;
  commentId?: string;
}

/**
 * Create a notification for a user
 * Automatically prevents self-notifications
 */
export async function createNotification({
  type,
  userId,
  actorId,
  message,
  postId,
  commentId,
}: CreateNotificationParams) {
  // Don't create notification if user is notifying themselves
  if (userId === actorId) {
    return null;
  }

  try {
    const notification = await prisma.notification.create({
      data: {
        type,
        userId,
        actorId,
        message,
        postId,
        commentId,
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
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

/**
 * Mark notifications as read
 */
export async function markNotificationsAsRead(userId: string, notificationIds: string[]) {
  try {
    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId, // Ensure user owns these notifications
      },
      data: {
        read: true,
      },
    });
    return true;
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return false;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });
    return true;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }
}

/**
 * Delete old notifications (older than 30 days)
 */
export async function cleanupOldNotifications() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo,
        },
        read: true, // Only delete read notifications
      },
    });
    return result.count;
  } catch (error) {
    console.error("Error cleaning up old notifications:", error);
    return 0;
  }
}
