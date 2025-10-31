"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

interface PostProps {
  post: {
    id: string;
    imageUrl: string;
    caption?: string | null;
    createdAt: Date;
    user: {
      id: string;
      username: string | null;
      name: string | null;
      image: string | null;
    };
    _count?: {
      likes: number;
      comments: number;
    };
  };
  isLiked?: boolean;
}

export function Post({ post, isLiked: initialIsLiked = false }: PostProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(post._count?.likes || 0);

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: isLiked ? "DELETE" : "POST",
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  return (
    <Card className="border-none shadow-none bg-white dark:bg-zinc-900">
      {/* Post Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <Link href={`/${post.user.username}`}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.user.image || ""} />
              <AvatarFallback>
                {post.user.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
          <Link 
            href={`/${post.user.username}`}
            className="text-sm font-semibold hover:text-gray-600 dark:hover:text-gray-300"
          >
            {post.user.username || post.user.name}
          </Link>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* Post Image */}
      <div className="relative aspect-square w-full">
        <Image
          src={post.imageUrl}
          alt={post.caption || "Post image"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 600px"
        />
      </div>

      {/* Post Actions */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLike}
              className="hover:bg-transparent"
            >
              <Heart
                className={`h-6 w-6 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
              />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-transparent">
              <MessageCircle className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-transparent">
              <Send className="h-6 w-6" />
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="hover:bg-transparent">
            <Bookmark className="h-6 w-6" />
          </Button>
        </div>

        {/* Likes Count */}
        {likesCount > 0 && (
          <p className="text-sm font-semibold">
            {likesCount} {likesCount === 1 ? "like" : "likes"}
          </p>
        )}

        {/* Caption */}
        {post.caption && (
          <div className="text-sm">
            <Link href={`/${post.user.username}`} className="font-semibold mr-2">
              {post.user.username || post.user.name}
            </Link>
            <span>{post.caption}</span>
          </div>
        )}

        {/* Comments Count */}
        {post._count && post._count.comments > 0 && (
          <Link 
            href={`/p/${post.id}`}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            View all {post._count.comments} comments
          </Link>
        )}

        {/* Time */}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </p>
      </div>
    </Card>
  );
}
