import { StoriesBarSkeleton } from "@/components/stories-skeleton";
import { PostSkeletonList } from "@/components/post-skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-black">
      <main className="flex-1 flex justify-center px-4 py-8">
        <div className="w-full max-w-[630px] space-y-6">
          {/* Stories Bar Skeleton */}
          <StoriesBarSkeleton />

          {/* Posts Feed Skeleton */}
          <PostSkeletonList count={3} />
        </div>
      </main>
    </div>
  );
}
