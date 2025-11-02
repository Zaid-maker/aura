"use client";

import { motion } from "framer-motion";
import { Heart, MessageCircle, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="mx-auto max-w-2xl px-4 py-4 md:py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold mb-6">Notifications</h1>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                All
              </TabsTrigger>
              <TabsTrigger value="likes" className="flex-1">
                Likes
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex-1">
                Comments
              </TabsTrigger>
              <TabsTrigger value="follows" className="flex-1">
                Follows
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="" />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-semibold">user{i}</span>{" "}
                            {i % 3 === 0
                              ? "started following you"
                              : i % 3 === 1
                                ? "liked your post"
                                : "commented on your post"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            2h ago
                          </p>
                        </div>
                        {i % 3 === 0 ? (
                          <UserPlus className="h-5 w-5 text-primary" />
                        ) : i % 3 === 1 ? (
                          <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                        ) : (
                          <MessageCircle className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="likes">
              <p className="text-center text-muted-foreground py-8">
                No likes yet
              </p>
            </TabsContent>

            <TabsContent value="comments">
              <p className="text-center text-muted-foreground py-8">
                No comments yet
              </p>
            </TabsContent>

            <TabsContent value="follows">
              <p className="text-center text-muted-foreground py-8">
                No new followers
              </p>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
