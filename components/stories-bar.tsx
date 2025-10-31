"use client";

import { Story } from "./story";

interface StoriesBarProps {
  stories: Array<{
    id: string;
    user: {
      id: string;
      username: string | null;
      name: string | null;
      image: string | null;
    };
  }>;
}

export function StoriesBar({ stories }: StoriesBarProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex gap-4 overflow-x-auto scrollbar-hide">
        {stories.map((story) => (
          <Story key={story.id} story={story} hasStory />
        ))}
      </div>
    </div>
  );
}
