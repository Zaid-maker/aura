"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Link2,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface PostViewProps {
  post: {
    id: string;
    imageUrl: string;
    caption?: string | null;
    createdAt: Date;
    user: {
      id: string;
      username: string | null;
      image: string | null;
    };
    comments: Array<{
      id: string;
      text: string;
      createdAt: Date;
      user: {
        id: string;
        username: string | null;
        image: string | null;
      };
    }>;
    isLiked?: boolean;
    isSaved?: boolean;
    likesCount: number;
    commentsCount: number;
  };
}

export function PostView({ post }: PostViewProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOwnPost = session?.user?.id === post.user.id;

  const handleLike = async () => {
    if (!session) {
      toast.error("Please sign in to like posts");
      return;
    }

    const previousIsLiked = isLiked;
    const previousLikesCount = likesCount;

    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
      });

      if (!response.ok) {
        setIsLiked(previousIsLiked);
        setLikesCount(previousLikesCount);
        toast.error("Failed to like post");
      }
    } catch (error) {
      setIsLiked(previousIsLiked);
      setLikesCount(previousLikesCount);
      toast.error("Failed to like post");
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      toast.error("Please sign in to comment");
      return;
    }

    if (!comment.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: comment }),
      });

      if (response.ok) {
        setComment("");
        toast.success("Comment added");
        router.refresh();
      } else {
        toast.error("Failed to add comment");
      }
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    toast.success("Link copied to clipboard");
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/delete`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Post deleted");
        router.push("/");
      } else {
        toast.error("Failed to delete post");
      }
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const handleBookmark = async () => {
    if (!session) {
      toast.error("Please sign in to bookmark posts");
      return;
    }

    try {
      const response = await fetch(`/api/posts/${post.id}/bookmark`, {
        method: isSaved ? "DELETE" : "POST",
      });

      if (response.ok) {
        setIsSaved(!isSaved);
        toast.success(isSaved ? "Bookmark removed" : "Post bookmarked");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to bookmark post");
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      toast.error("Failed to bookmark post");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="grid md:grid-cols-2 gap-0 md:gap-6">
        {/* Image Section */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative aspect-square bg-black">
              <Image
                src={post.imageUrl}
                alt={post.caption || "Post"}
                fill
                className="object-contain"
                priority
              />
            </div>
          </CardContent>
        </Card>

        {/* Details Section */}
        <Card>
          <CardContent className="p-0 flex flex-col h-full max-h-[600px]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <Link
                href={`/${post.user.username || post.user.id}`}
                className="flex items-center gap-3"
              >
                <Avatar>
                  <AvatarImage src={post.user.image || ""} />
                  <AvatarFallback>
                    {post.user.username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold hover:underline">
                    {post.user.username}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    @{post.user.username}
                  </p>
                </div>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleCopyLink}>
                    <Link2 className="mr-2 h-4 w-4" />
                    Copy link
                  </DropdownMenuItem>
                  {isOwnPost && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleDelete}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete post
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Caption */}
            {post.caption && (
              <div className="p-4 border-b">
                <div className="flex gap-3">
                  <Link href={`/${post.user.username || post.user.id}`}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={post.user.image || ""} />
                      <AvatarFallback>
                        {post.user.username?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1">
                    <Link
                      href={`/${post.user.username || post.user.id}`}
                      className="font-semibold hover:underline"
                    >
                      {post.user.username}
                    </Link>{" "}
                    <span className="text-sm">{post.caption}</span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(post.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {post.comments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No comments yet</p>
                  <p className="text-sm">Be the first to comment!</p>
                </div>
              ) : (
                post.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Link href={`/${comment.user.username || comment.user.id}`}>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.user.image || ""} />
                        <AvatarFallback>
                          {comment.user.username?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1">
                      <Link
                        href={`/${comment.user.username || comment.user.id}`}
                        className="font-semibold hover:underline text-sm"
                      >
                        {comment.user.username}
                      </Link>{" "}
                      <span className="text-sm">{comment.text}</span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Actions */}
            <div className="border-t">
              <div className="flex items-center justify-between p-4">
                <div className="flex gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLike}
                    className="hover:bg-transparent"
                  >
                    <Heart
                      className={`h-6 w-6 ${
                        isLiked
                          ? "fill-red-500 text-red-500"
                          : "hover:text-gray-400"
                      }`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-transparent"
                  >
                    <MessageCircle className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-transparent"
                  >
                    <Send className="h-6 w-6" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBookmark}
                  className="hover:bg-transparent"
                >
                  <Bookmark
                    className={`h-6 w-6 transition-all ${isSaved ? "fill-current scale-110" : ""}`}
                  />
                </Button>
              </div>

              {/* Likes Count */}
              <div className="px-4 pb-3">
                <p className="font-semibold text-sm">
                  {likesCount} {likesCount === 1 ? "like" : "likes"}
                </p>
              </div>

              {/* Add Comment */}
              {session && (
                <form onSubmit={handleComment} className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      disabled={isSubmitting}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={!comment.trim() || isSubmitting}
                      className="bg-linear-to-r from-purple-600 to-pink-600"
                    >
                      {isSubmitting ? "Posting..." : "Post"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
