import { Skeleton } from "@/components/ui/skeleton";

export function UserSuggestionSkeleton() {
  return (
    <div className="flex items-center gap-3 py-2">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-8 w-16 rounded-md" />
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <aside className="hidden lg:block w-80 p-6">
      <div className="space-y-6">
        {/* Current User */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>

        {/* Suggestions header */}
        <div className="flex items-center justify-between pt-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Suggestions list */}
        <div className="space-y-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <UserSuggestionSkeleton key={i} />
          ))}
        </div>

        {/* Footer links */}
        <div className="pt-6 space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    </aside>
  );
}
