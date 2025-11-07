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
  storyCount?: number; // Number of stories this user has
  onClick?: () => void; // Optional click handler
}

export function Story({
  story,
  hasStory = true,
  storyCount,
  onClick,
}: StoryProps) {
  const content = (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
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
        {/* Show story count badge if there are multiple stories */}
        {storyCount && storyCount > 1 && (
          <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white dark:border-zinc-900">
            {storyCount}
          </div>
        )}
      </div>
      <span className="text-xs truncate max-w-[70px] dark:text-gray-300">
        {story.user.username || story.user.name}
      </span>
    </div>
  );

  // If onClick is provided, use a button instead of Link
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="cursor-pointer">
        {content}
      </button>
    );
  }

  return (
    <Link
      href={`/stories/${story.user.username}`}
      className="flex flex-col items-center gap-1"
    >
      {content}
    </Link>
  );
}
