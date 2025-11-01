"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Link2,
  UserMinus,
  Flag,
  AlertCircle,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { CommentsDialog } from "@/components/comments-dialog";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

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
  isFollowing?: boolean;
}

export function Post({ post, isLiked: initialIsLiked = false, isFollowing: initialIsFollowing = false }: PostProps) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [likesCount, setLikesCount] = useState(post._count?.likes || 0);
  const [commentsCount, setCommentsCount] = useState(
    post._count?.comments || 0
  );
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isOwnPost = session?.user?.id === post.user.id;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/p/${post.id}`);
    toast.success("Link copied to clipboard");
  };

  const handleUnfollow = async () => {
    try {
      const response = await fetch(`/api/users/${post.user.id}/unfollow`, {
        method: "POST",
      });

      if (response.ok) {
        setIsFollowing(false);
        toast.success(`Unfollowed @${post.user.username || post.user.name}`);
        // Optionally reload the page to refresh the feed
        setTimeout(() => window.location.reload(), 1000);
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to unfollow");
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
      toast.error("Failed to unfollow");
    }
  };

  const handleFollow = async () => {
    try {
      const response = await fetch(`/api/users/${post.user.id}/follow`, {
        method: "POST",
      });

      if (response.ok) {
        setIsFollowing(true);
        toast.success(`Following @${post.user.username || post.user.name}`);
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to follow");
      }
    } catch (error) {
      console.error("Error following user:", error);
      toast.error("Failed to follow");
    }
  };

  const handleReport = () => {
    // Implement report logic
    toast.info("Report feature coming soon");
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/delete`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Post deleted successfully");
        setShowDeleteDialog(false);
        // Reload the page to refresh the feed
        setTimeout(() => window.location.reload(), 1000);
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

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
            {!isOwnPost && (
              <>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={isFollowing ? handleUnfollow : handleFollow}
                  className="text-sm font-semibold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 h-auto p-0 hover:bg-transparent"
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              </>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-transparent h-8 w-8"
              >
                <MoreHorizontal className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {isOwnPost ? (
                <>
                  <DropdownMenuItem onClick={handleDeleteClick} className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete post
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleCopyLink}>
                    <Link2 className="mr-2 h-4 w-4" />
                    Copy link
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  {isFollowing && (
                    <>
                      <DropdownMenuItem onClick={handleUnfollow} className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400">
                        <UserMinus className="mr-2 h-4 w-4" />
                        Unfollow
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleCopyLink}>
                    <Link2 className="mr-2 h-4 w-4" />
                    Copy link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleReport}>
                    <Flag className="mr-2 h-4 w-4" />
                    Report
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
