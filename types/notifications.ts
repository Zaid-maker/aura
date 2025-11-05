/**
 * Shared notification types
 * Single source of truth for notification-related type definitions
 */

export type NotificationType = "LIKE" | "COMMENT" | "FOLLOW" | "MENTION" | "STORY_VIEW";

export interface NotificationActor {
  id: string;
  username: string | null;
  name: string | null;
  image: string | null;
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
  actor: NotificationActor | null;
  postId?: string | null;
  commentId?: string | null;
}

export interface NotificationResponse {
  notifications: Notification[];
  nextCursor: string | null;
  unreadCount: number;
}
