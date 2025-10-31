"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { CommentsDialog } from "@/components/comments-dialog";

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
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(post._count?.likes || 0);
  const [commentsCount, setCommentsCount] = useState(
    post._count?.comments || 0
  );
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: isLiked ? "DELETE" : "POST",
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleDoubleClick = () => {
    if (!isLiked) {
      handleLike();
    }
  };

  const truncateCaption = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return showFullCaption ? text : text.slice(0, maxLength) + "...";
  };

  return (
    <>
      <Card className="border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-black">
        {/* Post Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href={`/${post.user.username}`}>
              <Avatar className="h-8 w-8 ring-1 ring-gray-200 dark:ring-zinc-800">
                <AvatarImage src={post.user.image || ""} />
                <AvatarFallback>
                  {post.user.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
            <Link
              href={`/${post.user.username}`}
              className="text-sm font-semibold hover:opacity-50 transition-opacity"
            >
              {post.user.username || post.user.name}
            </Link>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-transparent h-8 w-8"
          >
            <MoreHorizontal className="h-6 w-6" />
          </Button>
        </div>

        {/* Post Image */}
        <div
          className="relative aspect-square w-full bg-black cursor-pointer select-none"
          onDoubleClick={handleDoubleClick}
        >
          <Image
            src={post.imageUrl}
            alt={post.caption || "Post image"}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 600px"
            priority={false}
          />
        </div>

        {/* Post Actions */}
        <div className="px-4 pt-3 pb-2 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLike}
                className="hover:bg-transparent hover:opacity-50 h-8 w-8 transition-all p-0 -ml-2"
              >
                <Heart
                  className={`h-7 w-7 transition-all ${
                    isLiked
                      ? "fill-red-500 text-red-500 scale-110"
                      : "hover:text-gray-500 dark:hover:text-gray-400"
                  }`}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-transparent hover:opacity-50 h-8 w-8 transition-opacity p-0"
                onClick={() => setShowComments(true)}
              >
                <MessageCircle className="h-7 w-7 hover:text-gray-500 dark:hover:text-gray-400" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-transparent hover:opacity-50 h-8 w-8 transition-opacity p-0"
              >
                <Send className="h-7 w-7 hover:text-gray-500 dark:hover:text-gray-400" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-transparent hover:opacity-50 h-8 w-8 transition-opacity p-0 -mr-2"
              onClick={() => setIsSaved(!isSaved)}
            >
              <Bookmark
                className={`h-7 w-7 ${isSaved ? "fill-current" : ""}`}
              />
            </Button>
          </div>

          {/* Likes Count */}
          {likesCount > 0 && (
            <p className="text-sm font-semibold px-0">
              {likesCount.toLocaleString()}{" "}
              {likesCount === 1 ? "like" : "likes"}
            </p>
          )}

          {/* Caption */}
          {post.caption && (
            <div className="text-sm leading-tight">
              <Link
                href={`/${post.user.username}`}
                className="font-semibold hover:opacity-50 transition-opacity"
              >
                {post.user.username || post.user.name}
              </Link>{" "}
              <span className="text-gray-900 dark:text-gray-100">
                {truncateCaption(post.caption)}
              </span>
              {post.caption.length > 100 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullCaption(!showFullCaption)}
                  className="text-gray-500 dark:text-gray-400 ml-1 hover:opacity-50 hover:bg-transparent h-auto p-0 inline"
                >
                  {showFullCaption ? "less" : "more"}
                </Button>
              )}
            </div>
          )}

          {/* Comments Count */}
          {commentsCount > 0 && (
            <button
              onClick={() => setShowComments(true)}
              className="text-sm text-gray-500 dark:text-gray-400 hover:opacity-50 transition-opacity block text-left"
            >
              View all {commentsCount} comments
            </button>
          )}

          {/* Time */}
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>

        {/* Add Comment Section */}
        <div className="border-t border-gray-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-3">
          <Input
            type="text"
            placeholder="Add a comment..."
            className="flex-1 border-none bg-transparent text-sm outline-none shadow-none focus-visible:ring-0 px-0 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            onClick={() => setShowComments(true)}
            readOnly
          />
          <Button
            variant="ghost"
            size="sm"
            className="text-sm font-semibold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-transparent h-auto p-0"
            onClick={() => setShowComments(true)}
          >
            Post
          </Button>
        </div>
      </Card>

      {/* Comments Dialog */}
      <CommentsDialog
        open={showComments}
        onOpenChange={setShowComments}
        postId={post.id}
        onCommentAdded={() => setCommentsCount((prev) => prev + 1)}
      />
    </>
  );
}
