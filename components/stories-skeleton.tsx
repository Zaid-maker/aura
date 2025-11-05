import { Skeleton } from "@/components/ui/skeleton";

export function StorySkeleton() {
  return (
    <div className="flex shrink-0 flex-col items-center gap-2">
      <Skeleton className="h-16 w-16 rounded-full" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function StoriesBarSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-900 rounded-lg p-4 mb-6">
      <div className="flex gap-4 overflow-x-auto scrollbar-hide">
        {Array.from({ length: 8 }).map((_, i) => (
          <StorySkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
