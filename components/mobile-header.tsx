"use client";

import { motion } from "framer-motion";
import { Heart, MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function MobileHeader() {
  const pathname = usePathname();

  // Don't show on auth pages
  if (pathname?.startsWith("/auth")) {
    return null;
  }

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="sticky top-0 z-40 md:hidden bg-background/80 backdrop-blur-lg border-b"
    >
      <div className="flex items-center justify-between px-4 h-14">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Aura
        </Link>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/notifications">
              <Heart className="h-6 w-6" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/messages">
              <MessageCircle className="h-6 w-6" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
