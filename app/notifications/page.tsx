"use client";

import { useEffect, useState, useCallback } from "react";
import { NotificationItem } from "@/components/notification-item";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Notification, NotificationResponse } from "@/types/notifications";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  const fetchNotifications = useCallback(
    async (cursor?: string, unreadOnly = false) => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          limit: "20",
          ...(cursor && { cursor }),
          ...(unreadOnly && { unreadOnly: "true" }),
        });

        const response = await fetch(`/api/notifications?${params}`);
        if (response.ok) {
          const data: NotificationResponse = await response.json();
          
          if (cursor) {
            setNotifications((prev) => [...prev, ...data.notifications]);
          } else {
            setNotifications(data.notifications);
          }
          
          // Always use server-provided counts
          setUnreadCount(data.unreadCount);
          setTotalCount(data.totalCount);
          setNextCursor(data.nextCursor);
          setHasMore(!!data.nextCursor);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    // Reset pagination state when switching tabs
    setNextCursor(null);
    setHasMore(true);
    fetchNotifications(undefined, activeTab === "unread");
  }, [fetchNotifications, activeTab]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleLoadMore = () => {
    if (nextCursor && !isLoading) {
      fetchNotifications(nextCursor, activeTab === "unread");
    }
  };

  const displayedNotifications =
    activeTab === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
            Mark all as read
          </Button>
        )}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "all" | "unread")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="all">
            All {totalCount > 0 && `(${totalCount})`}
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {isLoading && notifications.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading notifications...</p>
            </div>
          ) : displayedNotifications.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">
                  {activeTab === "unread"
                    ? "No unread notifications"
                    : "No notifications yet"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activeTab === "all" &&
                    "When someone likes or comments on your posts, you'll see it here"}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-lg border divide-y">
              {displayedNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  {...notification}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
            </div>
          )}

          {hasMore && displayedNotifications.length > 0 && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={handleLoadMore}
                variant="outline"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Load more"}
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
