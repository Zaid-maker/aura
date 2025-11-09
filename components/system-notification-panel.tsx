"use client";

import { useState } from "react";
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
import { Bell, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function SystemNotificationPanel() {
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState<"all" | "specific">("all");
  const [targetUserIds, setTargetUserIds] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [lastSent, setLastSent] = useState<{
    count: number;
    timestamp: Date;
  } | null>(null);

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
        const ids = targetUserIds
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id.length > 0);

        if (ids.length === 0) {
          toast.error("Please enter at least one user ID");
          setIsSending(false);
          return;
        }

        body.targetUserIds = ids;
      }

      const response = await fetch("/api/admin/notifications/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(
          `System notification sent to ${data.recipientCount} user${data.recipientCount !== 1 ? "s" : ""}`
        );
        setMessage("");
        setTargetUserIds("");
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
          <RadioGroup value={targetType} onValueChange={(v) => setTargetType(v as "all" | "specific")}>
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
          <div className="space-y-2">
            <Label htmlFor="userIds">User IDs (comma-separated)</Label>
            <Input
              id="userIds"
              placeholder="user1_id, user2_id, user3_id"
              value={targetUserIds}
              onChange={(e) => setTargetUserIds(e.target.value)}
            />
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Enter user IDs separated by commas
            </p>
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
