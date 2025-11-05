import { Skeleton } from "@/components/ui/skeleton";

export function SearchResultSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-lg">
      <Skeleton className="h-12 w-12 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export function SearchResultsSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, i) => (
        <SearchResultSkeleton key={i} />
      ))}
    </div>
  );
}

export function SearchPageSkeleton() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-black">
      <main className="flex-1 flex justify-center px-4 py-8">
        <div className="w-full max-w-[630px] space-y-6">
          {/* Search input */}
          <Skeleton className="h-12 w-full rounded-lg" />

          {/* Results */}
          <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-900 rounded-lg overflow-hidden">
            <SearchResultsSkeleton count={10} />
          </div>
        </div>
      </main>
    </div>
  );
}
