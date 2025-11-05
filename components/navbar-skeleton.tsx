import { Skeleton } from "@/components/ui/skeleton";

export function NavbarSkeleton() {
  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 max-md:hidden">
      <div className="mx-auto max-w-6xl px-4 w-full">
        <div className="flex items-center justify-between h-16 w-full">
          {/* Logo */}
          <Skeleton className="h-8 w-16" />

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-8">
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center gap-6">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>
    </nav>
  );
}

export function MobileNavSkeleton() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 z-50">
      <div className="flex justify-around items-center h-16 px-4">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </nav>
  );
}

export function MobileHeaderSkeleton() {
  return (
    <header className="sticky top-0 z-40 md:hidden bg-background/80 backdrop-blur-lg border-b">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Logo */}
        <Skeleton className="h-8 w-16" />

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>
    </header>
  );
}
