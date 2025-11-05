import { Skeleton } from "@/components/ui/skeleton";
import { PostSkeletonList } from "@/components/post-skeleton";

export function ProfileHeaderSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-900 rounded-lg p-6 mb-6">
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <Skeleton className="h-32 w-32 rounded-full shrink-0" />

        {/* Info */}
        <div className="flex-1 space-y-4">
          {/* Username and actions */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>

          {/* Stats */}
          <div className="flex gap-8">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
          </div>

          {/* Name and bio */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfilePageSkeleton() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-black">
      <main className="flex-1 flex justify-center px-4 py-8">
        <div className="w-full max-w-[935px] space-y-6">
          <ProfileHeaderSkeleton />
          
          {/* Tabs */}
          <div className="border-t border-gray-200 dark:border-zinc-900">
            <div className="flex justify-center gap-12 py-3">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-3 gap-1 md:gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
