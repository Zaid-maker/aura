import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const cursor = searchParams.get("cursor");
    
    // Sanitize and validate limit parameter
    const rawLimit = searchParams.get("limit");
    let limit = parseInt(rawLimit || "10", 10);
    
    // Handle NaN, negative, zero, or excessively large values
    if (isNaN(limit) || limit < 1) {
      limit = 10; // Default to 10
    } else if (limit > 100) {
      limit = 100; // Cap at 100
    }

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

    // Fetch posts with cursor-based pagination
    const posts = await prisma.post.findMany({
      take: limit + 1, // Take one extra to determine if there are more posts
      ...(cursor && {
        cursor: {
          id: cursor,
        },
        skip: 1, // Skip the cursor
      }),
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
    });

    // Check if there are more posts
    let nextCursor: string | undefined = undefined;
    if (posts.length > limit) {
      const nextItem = posts.pop(); // Remove the extra item
      nextCursor = nextItem!.id;
    }

    // Add user interaction data to posts
    const postsWithUserData = posts.map((post) => ({
      ...post,
      isLiked: userLikes.includes(post.id),
      isFollowing: userFollowing.includes(post.user.id),
    }));

    return NextResponse.json({
      posts: postsWithUserData,
      nextCursor,
    });
  } catch (error) {
    console.error("Error fetching feed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
