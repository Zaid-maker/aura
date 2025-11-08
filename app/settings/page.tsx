"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Monitor, Trash2, Save, BadgeCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { data: session, update } = useSession();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Profile form state
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: "",
    image: "",
  });

  useEffect(() => {
    setMounted(true);
    
    // Load user data when session is available
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        username: session.user.username || "",
        bio: session.user.bio || "",
        image: session.user.image || "",
      });
    }
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!session?.user?.id) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        // Update the session with new data
        await update({
          ...session,
          user: {
            ...session.user,
            ...updatedUser,
          },
        });
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.message || "Failed to update profile" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred while saving" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
      });

      if (response.ok) {
        // Redirect to sign out page
        window.location.href = "/api/auth/signout";
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.message || "Failed to delete account" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how Aura looks on your device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base mb-4 block">Theme</Label>
              <RadioGroup value={theme} onValueChange={setTheme}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Light Mode */}
                  <label
                    htmlFor="light"
                    className={`flex flex-col items-center justify-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      theme === "light"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <RadioGroupItem
                      value="light"
                      id="light"
                      className="sr-only"
                    />
                    <Sun className="h-8 w-8" />
                    <div className="text-center">
                      <p className="font-semibold">Light</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Bright and clear
                      </p>
                    </div>
                  </label>

                  {/* Dark Mode */}
                  <label
                    htmlFor="dark"
                    className={`flex flex-col items-center justify-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      theme === "dark"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <RadioGroupItem
                      value="dark"
                      id="dark"
                      className="sr-only"
                    />
                    <Moon className="h-8 w-8" />
                    <div className="text-center">
                      <p className="font-semibold">Dark</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Easy on the eyes
                      </p>
                    </div>
                  </label>

                  {/* System Mode */}
                  <label
                    htmlFor="system"
                    className={`flex flex-col items-center justify-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      theme === "system"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <RadioGroupItem
                      value="system"
                      id="system"
                      className="sr-only"
                    />
                    <Monitor className="h-8 w-8" />
                    <div className="text-center">
                      <p className="font-semibold">System</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Matches device
                      </p>
                    </div>
                  </label>
                </div>
              </RadioGroup>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                The theme will be applied across all pages and persisted in your
                browser.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Success/Error Messages */}
            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.type === "success"
                    ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Profile Picture */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={formData.image || session?.user?.image || ""} />
                <AvatarFallback className="text-2xl">
                  {formData.name?.[0]?.toUpperCase() || session?.user?.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label htmlFor="image">Profile Image URL</Label>
                <Input
                  id="image"
                  name="image"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Your name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>

            {/* Username */}
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="username"
                value={formData.username}
                onChange={handleInputChange}
                className="mt-1"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Your unique username for your profile URL
              </p>
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={handleInputChange}
                className="mt-1 min-h-[100px]"
                maxLength={160}
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {formData.bio.length}/160 characters
              </p>
            </div>

            {/* Email (Read-only) */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={session?.user?.email || ""}
                disabled
                className="mt-1 bg-gray-50 dark:bg-gray-900"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Email cannot be changed
              </p>
            </div>

            {/* Admin Badge */}
            {session?.user?.role === "ADMIN" && (
              <div className="p-4 bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-2 border-purple-300 dark:border-purple-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500 rounded-full">
                    <BadgeCheck className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm">Administrator</p>
                      <span className="px-2 py-0.5 bg-purple-500 text-white text-xs font-bold rounded-full">
                        ADMIN
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      You have full administrative privileges on this platform
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Verification Status */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-semibold text-sm">Verification Status</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {session?.user?.verified ? "Your account is verified" : "Your account is not verified"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/admin/users/${session?.user?.id}/verify`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ verified: !session?.user?.verified }),
                      });
                      if (response.ok) {
                        window.location.reload();
                      }
                    } catch (error) {
                      console.error("Error toggling verification:", error);
                    }
                  }}
                >
                  {session?.user?.verified ? "Remove" : "Verify"} Badge
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                ⚠️ For testing only. In production, only admins can verify users.
              </p>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t">
              <Button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>

            {/* Danger Zone */}
            <div className="pt-6 border-t border-red-200 dark:border-red-900">
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                Danger Zone
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isLoading}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      account and remove all your data from our servers, including:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>All your posts and comments</li>
                        <li>Your profile information</li>
                        <li>Your followers and following</li>
                        <li>All your notifications</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Yes, delete my account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
            <CardDescription>Control who can see your content</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Privacy settings coming soon...
            </p>
          </CardContent>
        </Card>

        {/* Notifications Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Choose what notifications you receive
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Notification settings coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
