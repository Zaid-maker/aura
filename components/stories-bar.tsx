"use client";

import { useState } from "react";
import { Story } from "./story";
import { CreateStoryDialog } from "./create-story-dialog";
import { StoryViewer } from "./story-viewer";
import { Plus } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";

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
  const { data: session } = useSession();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [viewingStory, setViewingStory] = useState<{
    userId: string;
    userName: string;
    userImage: string | null;
  } | null>(null);

  const handleStoryClick = (story: any) => {
    setViewingStory({
      userId: story.user.id,
      userName: story.user.name || story.user.username || "User",
      userImage: story.user.image,
    });
  };

  return (
    <>
      <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-900 rounded-lg p-4 mb-6">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {/* Create Story Button */}
          {session && (
            <button
              onClick={() => setShowCreateDialog(true)}
              className="flex shrink-0 flex-col items-center gap-2 group"
            >
              <div className="relative">
                <Avatar className="h-16 w-16 border-2 border-gray-200 dark:border-zinc-800">
                  <AvatarImage src={session.user?.image || ""} />
                  <AvatarFallback>
                    {session.user?.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1">
                  <Plus className="h-3 w-3 text-white" />
                </div>
              </div>
              <span className="max-w-16 truncate text-center text-xs font-medium">
                Create Story
              </span>
            </button>
          )}

          {/* Existing Stories */}
          {stories.map((story) => (
            <Story 
              key={story.id} 
              story={story} 
              hasStory 
              onClick={() => handleStoryClick(story)}
            />
          ))}
        </div>
      </div>

      {/* Create Story Dialog */}
      <CreateStoryDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      {/* Story Viewer */}
      {viewingStory && (
        <StoryViewer
          open={!!viewingStory}
          onOpenChange={(open) => !open && setViewingStory(null)}
          userId={viewingStory.userId}
          userName={viewingStory.userName}
          userImage={viewingStory.userImage}
        />
      )}
    </>
  );
}
