"use client";

import { motion } from "framer-motion";
import { Search, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="mx-auto max-w-6xl px-4 py-4 md:py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search users, posts, or hashtags..."
                className="pl-10 h-12 rounded-xl"
              />
            </div>
          </div>

          {/* Trending Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Trending</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="aspect-square bg-linear-to-br from-purple-400 to-pink-400" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
