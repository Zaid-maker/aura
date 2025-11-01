import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Settings, Grid3x3, Bookmark, UserCircle2 } from "lucide-react";
import { FollowButton } from "@/components/follow-button";
import { EditProfileDialog } from "@/components/edit-profile-dialog";

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params;
  
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: username },
        { id: username }
      ]
    },
  });

  return {
    title: user ? `${user.name} (@${user.username}) • Aura` : "Profile • Aura",
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const session = await getServerSession(authOptions);

  // Find user by username or ID
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: username },
        { id: username }
      ]
    },
    include: {
      posts: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      },
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // Check if current user is following this profile
  let isFollowing = false;
  if (session?.user?.id) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: user.id,
        },
      },
    });
    isFollowing = !!follow;
  }

  const isOwnProfile = session?.user?.id === user.id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Avatar */}
        <div className="flex justify-center md:justify-start">
          <Avatar className="h-32 w-32 md:h-40 md:w-40">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback className="text-4xl">
              {user.name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-6">
            <h1 className="text-xl font-normal">{user.username || user.name}</h1>
            
            <div className="flex gap-2">
              {isOwnProfile ? (
                <>
                  <EditProfileDialog user={user} />
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <FollowButton
                  userId={user.id}
                  isFollowing={isFollowing}
                  isAuthenticated={!!session}
                />
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-8 mb-6 justify-center md:justify-start">
            <div className="text-center md:text-left">
              <span className="font-semibold">{user._count.posts}</span>{" "}
              <span className="text-gray-600">posts</span>
            </div>
            <Link href={`/${user.username}/followers`} className="hover:text-gray-600">
              <span className="font-semibold">{user._count.followers}</span>{" "}
              <span className="text-gray-600">followers</span>
            </Link>
            <Link href={`/${user.username}/following`} className="hover:text-gray-600">
              <span className="font-semibold">{user._count.following}</span>{" "}
              <span className="text-gray-600">following</span>
            </Link>
          </div>

          {/* Bio */}
          <div>
            <p className="font-semibold">{user.name}</p>
            {user.bio && <p className="whitespace-pre-wrap mt-1">{user.bio}</p>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full justify-center border-t">
          <TabsTrigger value="posts" className="flex gap-2">
            <Grid3x3 className="h-4 w-4" />
            <span className="hidden sm:inline">POSTS</span>
          </TabsTrigger>
          {isOwnProfile && (
            <TabsTrigger value="saved" className="flex gap-2">
              <Bookmark className="h-4 w-4" />
              <span className="hidden sm:inline">SAVED</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="tagged" className="flex gap-2">
            <UserCircle2 className="h-4 w-4" />
            <span className="hidden sm:inline">TAGGED</span>
          </TabsTrigger>
        </TabsList>

        {/* Posts Grid */}
        <TabsContent value="posts" className="mt-6">
          {user.posts.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 md:gap-4">
              {user.posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/p/${post.id}`}
                  className="relative aspect-square group"
                >
                  <Image
                    src={post.imageUrl}
                    alt={post.caption || "Post"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 33vw, 25vw"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-6 text-white">
                      <span className="flex items-center gap-1 font-semibold">
                        ❤️ {post._count.likes}
                      </span>
                      <span className="flex items-center gap-1 font-semibold">
                        💬 {post._count.comments}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-black mb-4">
                <Grid3x3 className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">No Posts Yet</h3>
              {isOwnProfile && (
                <p className="text-gray-600">
                  Share your first photo or video to get started.
                </p>
              )}
            </div>
          )}
        </TabsContent>

        {/* Saved Posts (Only for own profile) */}
        {isOwnProfile && (
          <TabsContent value="saved" className="mt-6">
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-black mb-4">
                <Bookmark className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Save posts</h3>
              <p className="text-gray-600">
                Save photos and videos that you want to see again.
              </p>
            </div>
          </TabsContent>
        )}

        {/* Tagged Posts */}
        <TabsContent value="tagged" className="mt-6">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-black mb-4">
              <UserCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Photos of you</h3>
            <p className="text-gray-600">
              When people tag you in photos, they'll appear here.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
