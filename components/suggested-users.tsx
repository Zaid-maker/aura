"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SuggestedUser {
  id: string;
  username: string | null;
  name: string | null;
  image: string | null;
}

interface SuggestedUsersProps {
  users: SuggestedUser[];
  currentUser?: {
    id: string;
    username: string | null;
    name: string | null;
    image: string | null;
  } | null;
}

export function SuggestedUsers({ users, currentUser }: SuggestedUsersProps) {
  return (
    <div className="hidden xl:block fixed right-12 top-24 w-80">
      {/* Current User */}
      {currentUser && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href={`/${currentUser.username}`}>
              <Avatar className="h-14 w-14">
                <AvatarImage src={currentUser.image || ""} />
                <AvatarFallback>
                  {currentUser.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link 
                href={`/${currentUser.username}`}
                className="font-semibold text-sm hover:text-gray-600"
              >
                {currentUser.username || currentUser.name}
              </Link>
              <p className="text-sm text-gray-500">{currentUser.name}</p>
            </div>
          </div>
          <Button variant="ghost" className="text-blue-500 text-xs font-semibold">
            Switch
          </Button>
        </div>
      )}

      {/* Suggestions Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-500">
          Suggested for you
        </h3>
        <Button variant="ghost" className="text-xs font-semibold h-auto p-0">
          See All
        </Button>
      </div>

      {/* Suggested Users List */}
      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/${user.username}`}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image || ""} />
                  <AvatarFallback>
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <Link 
                  href={`/${user.username}`}
                  className="font-semibold text-sm hover:text-gray-600"
                >
                  {user.username || user.name}
                </Link>
                <p className="text-xs text-gray-500">Suggested for you</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="text-blue-500 text-xs font-semibold h-auto p-0"
            >
              Follow
            </Button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 text-xs text-gray-400 space-y-2">
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          <Link href="/about" className="hover:underline">About</Link>
          <span>·</span>
          <Link href="/help" className="hover:underline">Help</Link>
          <span>·</span>
          <Link href="/press" className="hover:underline">Press</Link>
          <span>·</span>
          <Link href="/api" className="hover:underline">API</Link>
          <span>·</span>
          <Link href="/jobs" className="hover:underline">Jobs</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          <span>·</span>
          <Link href="/terms" className="hover:underline">Terms</Link>
        </div>
        <p>© 2025 APNAGRAM</p>
      </div>
    </div>
  );
}
