import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withAuthAndRateLimit } from "@/lib/api-protection";
import { createNotification } from "@/lib/notifications";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    // Apply authentication and rate limiting
    const protection = await withAuthAndRateLimit(req, "mutation");
    if (!protection.success) {
      return protection.response;
    }

    // TypeScript now knows protection has session and headers
    const { session, headers } = protection;
    const { postId } = await params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify post exists and get post owner
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { 
        id: true,
        userId: true,
        user: {
          select: {
            username: true,
            name: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if like already exists
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: postId,
          userId: user.id,
        },
      },
    });

    if (existingLike) {
      return NextResponse.json(
        { error: "Already liked" },
        { status: 400, headers },
      );
    }

    // Create like
    await prisma.like.create({
      data: {
        userId: user.id,
        postId: postId,
      },
    });

    // Create notification for post owner
    await createNotification({
      type: "LIKE",
      userId: post.userId,
      actorId: user.id,
      message: `${user.username || user.name || "Someone"} liked your post`,
      postId: postId,
    });

    return NextResponse.json({ success: true }, { headers });
  } catch (error) {
    console.error("Error liking post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    // Apply authentication and rate limiting
    const protection = await withAuthAndRateLimit(req, "mutation");
    if (!protection.success) {
      return protection.response;
    }

    // TypeScript now knows protection has session and headers
    const { session, headers } = protection;
    const { postId } = await params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete like
    await prisma.like.delete({
      where: {
        postId_userId: {
          postId: postId,
          userId: user.id,
        },
      },
    });

    return NextResponse.json({ success: true }, { headers });
  } catch (error) {
    console.error("Error unliking post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
