import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FollowButton } from "@/components/follow-button";

interface FollowingPageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function FollowingPage({ params }: FollowingPageProps) {
  const { username } = await params;
  const session = await getServerSession(authOptions);

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: username }, { id: username }],
    },
    include: {
      following: {
        include: {
          following: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              bio: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // Get current user's following list to show follow status
  const currentUserFollowing = session?.user?.id
    ? await prisma.follow.findMany({
        where: { followerId: session.user.id },
        select: { followingId: true },
      })
    : [];

  const followingIds = new Set(currentUserFollowing.map((f) => f.followingId));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Following</CardTitle>
        </CardHeader>
        <CardContent>
          {user.following.length > 0 ? (
            <div className="space-y-4">
              {user.following.map(({ following }) => (
                <div
                  key={following.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Link href={`/${following.username}`}>
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={following.image || ""} />
                        <AvatarFallback>
                          {following.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div>
                      <Link
                        href={`/${following.username}`}
                        className="font-semibold hover:text-gray-600"
                      >
                        {following.username || following.name}
                      </Link>
                      {following.bio && (
                        <p className="text-sm text-gray-600 truncate max-w-xs">
                          {following.bio}
                        </p>
                      )}
                    </div>
                  </div>
                  {session?.user?.id !== following.id && (
                    <FollowButton
                      userId={following.id}
                      isFollowing={followingIds.has(following.id)}
                      isAuthenticated={!!session}
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 py-8">
              Not following anyone yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
