import { Post } from "@/components/post";
import { StoriesBar } from "@/components/stories-bar";
import { SuggestedUsers } from "@/components/suggested-users";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  // Get current user's likes
  let userLikes: string[] = [];
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        likes: {
          select: {
            postId: true,
          },
        },
      },
    });
    userLikes = user?.likes.map((like) => like.postId) || [];
  }

  // Fetch posts with user data, likes, and comments count
  const posts = await prisma.post.findMany({
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });

  // Fetch recent stories (not expired)
  const stories = await prisma.story.findMany({
    where: {
      expiresAt: {
        gte: new Date(),
      },
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  // Fetch suggested users (random users for now)
  const suggestedUsers = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
    },
    take: 5,
  });

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-black">
      <main className="flex-1 flex justify-center px-4 py-8">
        <div className="w-full max-w-[630px] space-y-6">
          {/* Stories Bar */}
          {stories.length > 0 && <StoriesBar stories={stories} />}

          {/* Posts Feed */}
          <div className="space-y-6">
            {posts.length > 0 ? (
              posts.map((post) => (
                <Post
                  key={post.id}
                  post={{
                    ...post,
                    createdAt: post.createdAt,
                  }}
                  isLiked={userLikes.includes(post.id)}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold mb-2">
                  Welcome to Apnagram!
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Start following people to see their posts in your feed.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Suggested Users Sidebar */}
        <SuggestedUsers users={suggestedUsers} />
      </main>
    </div>
  );
}
