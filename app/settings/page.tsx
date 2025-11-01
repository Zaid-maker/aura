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
import { Moon, Sun, Monitor } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Account settings coming soon...
            </p>
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
