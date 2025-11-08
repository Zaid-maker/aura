import { Post } from "@/components/post";
import { StoriesBar } from "@/components/stories-bar";
import { SuggestedUsers } from "@/components/suggested-users";
import { InfiniteScrollFeed } from "@/components/infinite-scroll-feed";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Get current user's likes and following
  let userLikes: string[] = [];
  let userFollowing: string[] = [];
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        likes: {
          select: {
            postId: true,
          },
        },
        following: {
          select: {
            followingId: true,
          },
        },
      },
    });
    userLikes = user?.likes.map((like) => like.postId) || [];
    userFollowing = user?.following.map((follow) => follow.followingId) || [];
  }

  // Fetch initial batch of posts (10 posts)
  const initialLimit = 10;
  const posts = await prisma.post.findMany({
    take: initialLimit + 1, // Take one extra to check if there are more
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
          verified: true,
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
  });

  // Determine if there are more posts
  let initialCursor: string | undefined = undefined;
  let initialPosts = posts;
  if (posts.length > initialLimit) {
    const nextItem = posts.pop(); // Remove the extra item
    initialCursor = nextItem!.id;
  }

  // Add user interaction data to posts
  const postsWithUserData = initialPosts.map((post) => ({
    ...post,
    isLiked: userLikes.includes(post.id),
    isFollowing: userFollowing.includes(post.user.id),
  }));

  // Fetch recent stories (grouped by user)
  const allStories = await prisma.story.findMany({
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
          verified: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Group stories by user
  const storiesGrouped = allStories.reduce(
    (acc, story) => {
      const userId = story.user.id;
      if (!acc[userId]) {
        acc[userId] = {
          user: story.user,
          stories: [],
        };
      }
      acc[userId].stories.push(story);
      return acc;
    },
    {} as Record<
      string,
      {
        user: {
          id: string;
          username: string | null;
          name: string | null;
          image: string | null;
        };
        stories: any[];
      }
    >
  );

  const stories = Object.values(storiesGrouped);

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
          {/* Stories Bar - Always show so users can create stories */}
          <StoriesBar stories={stories} />

          {/* Posts Feed with Infinite Scroll */}
          <InfiniteScrollFeed
            initialPosts={postsWithUserData}
            initialCursor={initialCursor}
          />
        </div>

        {/* Suggested Users Sidebar */}
        <SuggestedUsers users={suggestedUsers} />
      </main>
    </div>
  );
}
