"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

interface StoryProps {
  story: {
    id: string;
    user: {
      id: string;
      username: string | null;
      name: string | null;
      image: string | null;
    };
  };
  hasStory?: boolean;
}

export function Story({ story, hasStory = true }: StoryProps) {
  return (
    <Link
      href={`/stories/${story.user.username}`}
      className="flex flex-col items-center gap-1"
    >
      <div
        className={`rounded-full p-0.5 ${
          hasStory
            ? "bg-linear-to-tr from-yellow-400 via-red-500 to-pink-500"
            : "bg-gray-300 dark:bg-zinc-700"
        }`}
      >
        <div className="rounded-full p-0.5 bg-white dark:bg-zinc-900">
          <Avatar className="h-14 w-14">
            <AvatarImage src={story.user.image || ""} />
            <AvatarFallback>
              {story.user.name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
      <span className="text-xs truncate max-w-[70px] dark:text-gray-300">
        {story.user.username || story.user.name}
      </span>
    </Link>
  );
}
