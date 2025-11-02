import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        results: [],
        message: "Query too short",
      });
    }

    const searchTerm = query.trim();

    // Search users
    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            username: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
      },
      take: 5,
    });

    // Search posts by caption
    const posts = await prisma.post.findMany({
      where: {
        caption: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        caption: true,
        imageUrl: true,
        user: {
          select: {
            username: true,
          },
        },
      },
      take: 5,
    });

    // Create hashtag results (if query starts with #)
    const hashtags = searchTerm.startsWith("#")
      ? [
          {
            id: searchTerm,
            type: "hashtag" as const,
            name: searchTerm,
            postCount: Math.floor(Math.random() * 1000), // TODO: Calculate real count
          },
        ]
      : [];

    // Format results
    const results = [
      ...users.map((user) => ({
        id: user.id,
        type: "user" as const,
        name: user.name || "",
        username: user.username || "",
        image: user.image || undefined,
      })),
      ...posts.map((post) => ({
        id: post.id,
        type: "post" as const,
        name: post.caption || "Untitled Post",
        username: post.user.username || "",
        image: post.imageUrl || undefined,
      })),
      ...hashtags,
    ];

    return NextResponse.json({
      results,
      query: searchTerm,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search" },
      { status: 500 }
    );
  }
}
