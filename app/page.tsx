import { Post } from "@/components/post";
import { StoriesBar } from "@/components/stories-bar";
import { SuggestedUsers } from "@/components/suggested-users";
import { prisma } from "@/lib/prisma";

export default async function Home() {
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
    <div className="flex min-h-screen bg-gray-50">
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
                />
              ))
            ) : (
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold mb-2">
                  Welcome to Apnagram!
                </h2>
                <p className="text-gray-600">
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
