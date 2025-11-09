import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SystemNotificationPanel } from "@/components/system-notification-panel";
import { Shield } from "lucide-react";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and is an admin
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-purple-500" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Manage system-wide notifications and settings
        </p>
      </div>

      <div className="space-y-6">
        <SystemNotificationPanel />
      </div>
    </div>
  );
}
