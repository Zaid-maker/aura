"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Search,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface User {
  id: string;
  username: string | null;
  name: string | null;
  email: string | null;
  image: string | null;
}

export function SystemNotificationPanel() {
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState<"all" | "specific">("all");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [lastSent, setLastSent] = useState<{
    count: number;
    timestamp: Date;
  } | null>(null);

  // Load users when specific target is selected
  useEffect(() => {
    if (targetType === "specific" && users.length === 0) {
      loadUsers();
    }
  }, [targetType]);

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        toast.error("Failed to load users");
      }
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("An error occurred while loading users");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const toggleSelectAll = () => {
    const filtered = getFilteredUsers();
    if (selectedUserIds.length === filtered.length && filtered.length > 0) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filtered.map((u) => u.id));
    }
  };

  const getFilteredUsers = () => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.username?.toLowerCase().includes(query) ||
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query),
    );
  };

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsSending(true);

    try {
      const body: {
        message: string;
        targetType: string;
        targetUserIds?: string[];
      } = {
        message: message.trim(),
        targetType,
      };

      if (targetType === "specific") {
        if (selectedUserIds.length === 0) {
          toast.error("Please select at least one user");
          setIsSending(false);
          return;
        }

        body.targetUserIds = selectedUserIds;
      }

      const response = await fetch("/api/admin/notifications/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(
          `System notification sent to ${data.recipientCount} user${data.recipientCount !== 1 ? "s" : ""}`,
        );
        setMessage("");
        setSelectedUserIds([]);
        setSearchQuery("");
        setLastSent({
          count: data.recipientCount,
          timestamp: new Date(),
        });
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to send notification");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("An error occurred while sending the notification");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-500" />
          <CardTitle>System Notifications</CardTitle>
        </div>
        <CardDescription>
          Send notifications to all users or specific users
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Last sent info */}
        {lastSent && (
          <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle2 className="h-4 w-4" />
              <p className="text-sm font-medium">
                Last notification sent to {lastSent.count} user
                {lastSent.count !== 1 ? "s" : ""} at{" "}
                {lastSent.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}

        {/* Message */}
        <div className="space-y-2">
          <Label htmlFor="message">Notification Message *</Label>
          <Textarea
            id="message"
            placeholder="Enter your system notification message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px]"
            maxLength={500}
          />
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {message.length}/500 characters
          </p>
        </div>

        {/* Target Type */}
        <div className="space-y-3">
          <Label>Recipients</Label>
          <RadioGroup
            value={targetType}
            onValueChange={(v) => setTargetType(v as "all" | "specific")}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="font-normal cursor-pointer">
                All users
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="specific" id="specific" />
              <Label htmlFor="specific" className="font-normal cursor-pointer">
                Specific users
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Specific User IDs */}
        {targetType === "specific" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Select Users
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={toggleSelectAll}
                disabled={isLoadingUsers || getFilteredUsers().length === 0}
              >
                {selectedUserIds.length === getFilteredUsers().length &&
                getFilteredUsers().length > 0
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by username, name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* User List */}
            {isLoadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <ScrollArea className="h-[300px] border rounded-lg">
                <div className="p-4 space-y-3">
                  {getFilteredUsers().length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      {searchQuery ? "No users found" : "No users available"}
                    </p>
                  ) : (
                    getFilteredUsers().map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => toggleUserSelection(user.id)}
                      >
                        <Checkbox
                          checked={selectedUserIds.includes(user.id)}
                          onCheckedChange={() => toggleUserSelection(user.id)}
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        />
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.image || ""} />
                          <AvatarFallback>
                            {user.username?.[0]?.toUpperCase() ||
                              user.name?.[0]?.toUpperCase() ||
                              "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {user.username || user.name || "Unknown User"}
                          </p>
                          {user.email && (
                            <p className="text-xs text-gray-500 truncate">
                              {user.email}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            )}

            {/* Selected count */}
            {selectedUserIds.length > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedUserIds.length} user
                {selectedUserIds.length !== 1 ? "s" : ""} selected
              </p>
            )}
          </div>
        )}

        {/* Warning */}
        <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-700 dark:text-yellow-300 mt-0.5" />
            <div className="text-xs text-yellow-700 dark:text-yellow-300">
              <p className="font-medium">Important:</p>
              <p>
                System notifications will be sent immediately and cannot be
                undone. Please review your message carefully before sending.
              </p>
            </div>
          </div>
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={isSending || !message.trim()}
          className="w-full"
        >
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send System Notification
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
