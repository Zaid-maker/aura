import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthAndRateLimit } from "@/lib/api-protection";

export async function POST(req: NextRequest) {
  try {
    // Apply authentication and rate limiting
    const protection = await withAuthAndRateLimit(req, "mutation");
    if (!protection.success) {
      return protection.response;
    }

    // TypeScript now knows protection has session and headers
    const { session, headers } = protection;

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    // Set expiration to 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const story = await prisma.story.create({
      data: {
        imageUrl,
        userId: user.id,
        expiresAt,
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
    });

    return NextResponse.json({ success: true, story }, { headers });
  } catch (error) {
    console.error("Error creating story:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get all active stories (not expired)
export async function GET(req: NextRequest) {
  try {
    const stories = await prisma.story.findMany({
      where: {
        expiresAt: {
          gte: new Date(), // Only get stories that haven't expired
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
    });

    // Group stories by user
    const groupedStories = stories.reduce((acc, story) => {
      const userId = story.user.id;
      if (!acc[userId]) {
        acc[userId] = {
          user: story.user,
          stories: [],
        };
      }
      acc[userId].stories.push(story);
      return acc;
    }, {} as Record<string, { user: any; stories: any[] }>);

    return NextResponse.json(Object.values(groupedStories));
  } catch (error) {
    console.error("Error fetching stories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
