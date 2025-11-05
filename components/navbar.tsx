"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Home,
  MessageCircle,
  PlusSquare,
  Search,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { CreatePostDialog } from "@/components/create-post-dialog";
import { NavbarSkeleton } from "@/components/navbar-skeleton";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [createPostOpen, setCreatePostOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  // Don't show navbar on auth pages
  if (pathname?.startsWith("/auth")) {
    return null;
  }

  // Show skeleton while loading session
  if (status === "loading") {
    return <NavbarSkeleton />;
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 max-md:hidden">
        <div className="mx-auto max-w-6xl px-4 w-full">
          <div className="flex items-center justify-between h-16 w-full">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold">
              Aura
            </Link>

            {/* Search Bar (Desktop) */}
            <div className="hidden md:flex items-center flex-1 max-w-xs mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-zinc-700"
                />
              </div>
            </div>

            {/* Navigation Icons */}
            <div className="flex items-center gap-6">
              <ModeToggle />

              <Link href="/">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-transparent"
                >
                  <Home
                    className={`h-6 w-6 ${isActive("/") ? "fill-current" : ""}`}
                  />
                </Button>
              </Link>

              <Link href="/explore">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-transparent"
                >
                  <Search className="h-6 w-6" />
                </Button>
              </Link>

              {session && (
                <>
                  <Link href="/messages">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-transparent"
                    >
                      <MessageCircle className="h-6 w-6" />
                    </Button>
                  </Link>

                  <Link href="/notifications">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-transparent"
                    >
                      <Heart className="h-6 w-6" />
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-transparent"
                    onClick={() => setCreatePostOpen(true)}
                  >
                    <PlusSquare className="h-6 w-6" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="h-8 w-8 cursor-pointer">
                        <AvatarImage src={session.user.image || ""} />
                        <AvatarFallback>
                          {session.user.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/${session.user.username || session.user.id}`}
                          className="cursor-pointer"
                        >
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Saved</DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="cursor-pointer">
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                        className="cursor-pointer text-red-600"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}

              {!session && (
                <Link href="/auth/signin">
                  <Button>Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      {/* Create Post Dialog - Rendered outside nav for proper positioning */}
      <CreatePostDialog
        open={createPostOpen}
        onOpenChange={setCreatePostOpen}
      />
    </>
  );
}
