"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingUp, User, Hash, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface SearchResult {
  id: string;
  type: "user" | "post" | "hashtag";
  name: string;
  username?: string;
  image?: string;
  postCount?: number;
}

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch trending posts
  useEffect(() => {
    const fetchTrendingPosts = async () => {
      try {
        const response = await fetch("/api/posts?limit=12");
        const data = await response.json();
        setTrendingPosts(data.posts || []);
      } catch (error) {
        console.error("Error fetching trending posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingPosts();
  }, []);

  // Search functionality
  useEffect(() => {
    const searchContent = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery)}`
        );
        const data = await response.json();
        setSearchResults(data.results || []);
      } catch (error) {
        console.error("Error searching:", error);
        setSearchResults([]);
      }
    };

    const debounce = setTimeout(() => {
      searchContent();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearching(false);
  };

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
                className="pl-10 pr-10 h-12 rounded-xl border-2 focus-visible:ring-purple-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Search Results */}
          <AnimatePresence mode="wait">
            {isSearching && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6"
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {searchResults.map((result) => (
                        <Link
                          key={result.id}
                          href={
                            result.type === "user"
                              ? `/${result.username}`
                              : result.type === "hashtag"
                                ? `/explore?tag=${result.name.replace("#", "")}`
                                : `/post/${result.id}`
                          }
                        >
                          <motion.div
                            whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
                            className="flex items-center gap-3 p-2 rounded-lg cursor-pointer"
                          >
                            {result.type === "user" && (
                              <>
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={result.image} />
                                  <AvatarFallback>
                                    {result.name?.[0]?.toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="font-semibold">
                                    {result.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    @{result.username}
                                  </p>
                                </div>
                                <User className="h-5 w-5 text-muted-foreground" />
                              </>
                            )}
                            {result.type === "hashtag" && (
                              <>
                                <div className="h-12 w-12 rounded-full bg-linear-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                                  <Hash className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold">
                                    {result.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {result.postCount} posts
                                  </p>
                                </div>
                                <Badge variant="secondary">Trending</Badge>
                              </>
                            )}
                            {result.type === "post" && result.image && (
                              <>
                                <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100">
                                  <Image
                                    src={result.image}
                                    alt="Post"
                                    width={48}
                                    height={48}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold line-clamp-1">
                                    {result.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    by @{result.username}
                                  </p>
                                </div>
                              </>
                            )}
                          </motion.div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {isSearching && searchQuery && searchResults.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-6 text-center py-8"
              >
                <p className="text-muted-foreground">
                  No results found for "{searchQuery}"
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trending Section */}
          {!isSearching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <h2 className="text-xl font-bold">Trending Now</h2>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="aspect-square bg-muted rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {trendingPosts.slice(0, 12).map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link href={`/post/${post.id}`}>
                        <Card className="overflow-hidden cursor-pointer group">
                          <CardContent className="p-0 relative">
                            {post.imageUrl ? (
                              <div className="aspect-square relative overflow-hidden">
                                <Image
                                  src={post.imageUrl}
                                  alt={post.caption || "Post"}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                              </div>
                            ) : (
                              <div className="aspect-square bg-linear-to-br from-purple-400 via-pink-400 to-purple-400" />
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}

              {!loading && trendingPosts.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      No trending posts yet. Be the first to post!
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
