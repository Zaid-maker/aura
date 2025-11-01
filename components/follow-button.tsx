"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  isAuthenticated: boolean;
}

export function FollowButton({
  userId,
  isFollowing: initialIsFollowing,
  isAuthenticated,
}: FollowButtonProps) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      router.push("/auth/signin");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: isFollowing ? "DELETE" : "POST",
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
        router.refresh();
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleFollow}
      disabled={isLoading}
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      className={isFollowing ? "" : "bg-blue-500 hover:bg-blue-600"}
    >
      {isLoading ? "..." : isFollowing ? "Following" : "Follow"}
    </Button>
  );
}
