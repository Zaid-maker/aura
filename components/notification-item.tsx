"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Heart, MessageCircle, UserPlus, Eye, Bell } from "lucide-react";
import type {
  NotificationType,
  NotificationActor,
} from "@/types/notifications";
import { VerifiedBadge } from "@/components/verified-badge";

interface NotificationItemProps {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
  actor: NotificationActor | null;
  postId?: string | null;
  onMarkAsRead?: (id: string) => void;
}

const notificationIcons = {
  LIKE: <Heart className="h-4 w-4 text-red-500" fill="currentColor" />,
  COMMENT: <MessageCircle className="h-4 w-4 text-blue-500" />,
  FOLLOW: <UserPlus className="h-4 w-4 text-green-500" />,
  MENTION: <MessageCircle className="h-4 w-4 text-purple-500" />,
  STORY_VIEW: <Eye className="h-4 w-4 text-orange-500" />,
  SYSTEM: <Bell className="h-4 w-4 text-blue-500" fill="currentColor" />,
};

export function NotificationItem({
  id,
  type,
  message,
  read,
  createdAt,
  actor,
  postId,
  onMarkAsRead,
}: NotificationItemProps) {
  const handleClick = () => {
    if (!read && onMarkAsRead) {
      onMarkAsRead(id);
    }
  };

  // System notifications have special rendering
  if (type === "SYSTEM") {
    return (
      <div
        className={`flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
          !read
            ? "bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500"
            : ""
        }`}
        onClick={handleClick}
      >
        <div className="relative">
          <div className="h-10 w-10 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Bell className="h-5 w-5 text-white" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-blue-500 hover:bg-blue-600 text-white text-xs">
              SYSTEM
            </Badge>
          </div>
          <p className="text-sm font-medium">{message}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </p>
        </div>

        {!read && (
          <div className="shrink-0">
            <div className="h-2 w-2 bg-blue-500 rounded-full" />
          </div>
        )}
      </div>
    );
  }

  const notificationContent = (
    <div
      className={`flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
        !read ? "bg-muted/30" : ""
      }`}
      onClick={handleClick}
    >
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={actor?.image || undefined}
            alt={actor?.name || "User"}
          />
          <AvatarFallback>
            {actor?.name?.[0] || actor?.username?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
          {notificationIcons[type]}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-semibold inline-flex items-center gap-1">
            {actor?.username || actor?.name || "Someone"}
            <VerifiedBadge verified={actor?.verified} size="sm" />
          </span>{" "}
          {message
            .replace(actor?.username || actor?.name || "Someone", "")
            .trim()}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </p>
      </div>

      {!read && (
        <div className="shrink-0">
          <div className="h-2 w-2 bg-blue-500 rounded-full" />
        </div>
      )}
    </div>
  );

  if (postId && type !== "FOLLOW") {
    return (
      <Link href={`/posts/${postId}`} className="block">
        {notificationContent}
      </Link>
    );
  }

  if (type === "FOLLOW" && actor) {
    return (
      <Link href={`/profile/${actor.id}`} className="block">
        {notificationContent}
      </Link>
    );
  }

  return <div>{notificationContent}</div>;
}
