"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Post } from "@/components/post";
import { PostSkeletonList } from "@/components/post-skeleton";
import { Loader2 } from "lucide-react";

interface PostData {
  id: string;
  imageUrl: string;
  caption: string | null;
  createdAt: Date;
  user: {
    id: string;
    username: string | null;
    name: string | null;
    image: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
  isLiked: boolean;
  isFollowing: boolean;
  isSaved: boolean;
}

interface InfiniteScrollFeedProps {
  initialPosts: PostData[];
  initialCursor: string | undefined;
}

export function InfiniteScrollFeed({
  initialPosts,
  initialCursor,
}: InfiniteScrollFeedProps) {
  const [posts, setPosts] = useState<PostData[]>(initialPosts);
  const [cursor, setCursor] = useState<string | undefined>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(!!initialCursor);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMorePosts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/posts/feed?limit=10${cursor ? `&cursor=${cursor}` : ""}`,
      );
      const data = await response.json();

      if (data.posts && data.posts.length > 0) {
        setPosts((prev) => [...prev, ...data.posts]);
        setCursor(data.nextCursor);
        setHasMore(!!data.nextCursor);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setLoading(false);
    }
  }, [cursor, loading, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 },
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMorePosts, hasMore, loading]);

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Welcome to Aura! 🌟</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Start following people to see their posts and build your aura.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Post
          key={post.id}
          post={{
            ...post,
            createdAt: post.createdAt,
          }}
          isLiked={post.isLiked}
          isFollowing={post.isFollowing}
          isSaved={post.isSaved}
        />
      ))}

      {/* Loading skeletons */}
      {loading && <PostSkeletonList count={2} />}

      {/* Intersection observer target and end message */}
      <div ref={observerTarget} className="flex justify-center py-8">
        {!hasMore && posts.length > 0 && (
          <p className="text-gray-500 dark:text-gray-500">
            You've reached the end! 🎉
          </p>
        )}
      </div>
    </div>
  );
}
