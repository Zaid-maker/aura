import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/posts/[id]/bookmark - Bookmark a post
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const postId = params.id;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if already bookmarked
    const existingBookmark = await prisma.savedPost.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: user.id,
        },
      },
    });

    if (existingBookmark) {
      return NextResponse.json(
        { error: "Post already bookmarked" },
        { status: 400 },
      );
    }

    // Create bookmark
    await prisma.savedPost.create({
      data: {
        postId,
        userId: user.id,
      },
    });

    return NextResponse.json({ message: "Post bookmarked successfully" });
  } catch (error) {
    console.error("Error bookmarking post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/posts/[id]/bookmark - Remove bookmark from a post
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const postId = params.id;

    // Check if bookmark exists
    const existingBookmark = await prisma.savedPost.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: user.id,
        },
      },
    });

    if (!existingBookmark) {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 },
      );
    }

    // Delete bookmark
    await prisma.savedPost.delete({
      where: {
        postId_userId: {
          postId,
          userId: user.id,
        },
      },
    });

    return NextResponse.json({ message: "Bookmark removed successfully" });
  } catch (error) {
    console.error("Error removing bookmark:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
