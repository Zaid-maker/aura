"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { VerifiedBadge } from "@/components/verified-badge";

interface Story {
  id: string;
  imageUrl: string;
  createdAt: Date;
}

interface StoryViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  userImage: string | null;
  userVerified?: boolean;
}

export function StoryViewer({
  open,
  onOpenChange,
  userId,
  userName,
  userImage,
  userVerified = false,
}: StoryViewerProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (open && userId) {
      fetchStories();
    }
  }, [open, userId]);

  // Preload next and previous images
  useEffect(() => {
    if (stories.length === 0) return;

    const preloadImages = [];

    // Preload next image
    if (currentIndex < stories.length - 1) {
      const nextImg = new window.Image();
      nextImg.src = stories[currentIndex + 1].imageUrl;
      preloadImages.push(nextImg);
    }

    // Preload previous image
    if (currentIndex > 0) {
      const prevImg = new window.Image();
      prevImg.src = stories[currentIndex - 1].imageUrl;
      preloadImages.push(prevImg);
    }
  }, [currentIndex, stories]);

  useEffect(() => {
    if (!open || stories.length === 0 || isPaused || imageLoading) return;

    setProgress(0);
    const duration = 5000; // 5 seconds per story
    const interval = 50; // Update every 50ms
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, stories, open, isPaused, imageLoading]);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/stories/${userId}`);
      const data = await response.json();
      setStories(data.stories || []);
    } catch (error) {
      console.error("Error fetching stories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setImageLoading(true);
    } else {
      onOpenChange(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setImageLoading(true);
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    return `${hours}h ago`;
  };

  if (!open || stories.length === 0) return null;

  const currentStory = stories[currentIndex];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px] h-[90vh] p-0 bg-black border-none">
        <VisuallyHidden>
          <DialogTitle>{userName}&apos;s Story</DialogTitle>
        </VisuallyHidden>
        <div className="relative w-full h-full">
          {/* Progress bars */}
          <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
            {stories.map((_, index) => (
              <div
                key={index}
                className="h-0.5 flex-1 bg-white/30 rounded-full overflow-hidden"
              >
                <div
                  className="h-full bg-white transition-all duration-100"
                  style={{
                    width:
                      index < currentIndex
                        ? "100%"
                        : index === currentIndex
                          ? `${progress}%`
                          : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-4 left-0 right-0 z-20 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border-2 border-white">
                <AvatarImage src={userImage || ""} />
                <AvatarFallback>{userName[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-white">
                    {userName}
                  </span>
                  <VerifiedBadge verified={userVerified} size="sm" />
                </div>
                <span className="text-xs text-white/80">
                  {getTimeAgo(currentStory.createdAt)}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Story Image */}
          <div className="relative w-full h-full">
            {/* Loading spinner */}
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            )}

            <Image
              src={currentStory.imageUrl}
              alt="Story"
              fill
              className="object-contain"
              priority={currentIndex === 0}
              loading={currentIndex === 0 ? "eager" : "lazy"}
              quality={85}
              sizes="(max-width: 500px) 100vw, 500px"
              onLoadingComplete={() => setImageLoading(false)}
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
          </div>

          {/* Navigation */}
          <div className="absolute inset-0 z-10 flex">
            <button
              onClick={handlePrevious}
              onMouseDown={() => setIsPaused(true)}
              onMouseUp={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
              className="flex-1 cursor-pointer"
              disabled={currentIndex === 0}
            >
              {currentIndex > 0 && (
                <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity">
                  <ChevronLeft className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
              )}
            </button>
            <button
              onClick={handleNext}
              onMouseDown={() => setIsPaused(true)}
              onMouseUp={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
              className="flex-1 cursor-pointer"
            >
              {currentIndex < stories.length - 1 && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity">
                  <ChevronRight className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
