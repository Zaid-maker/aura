import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withAuthAndRateLimit, sanitizeInput } from "@/lib/api-protection";
import { createNotification } from "@/lib/notifications";

// Get comments for a post
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const { postId } = await params;

    const comments = await prisma.comment.findMany({
      where: { postId },
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

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Create a comment
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
    const body = await req.json();
    const { text } = body;

    // Validate and sanitize input
    if (!text || typeof text !== "string" || text.trim() === "") {
      return NextResponse.json(
        { error: "Comment text is required" },
        { status: 400 },
      );
    }

    // Sanitize and limit comment length
    const sanitizedText = sanitizeInput(text);

    // Check if sanitized text is empty (after removing malicious content)
    if (sanitizedText.length === 0) {
      return NextResponse.json(
        { error: "Comment text is required" },
        { status: 400 },
      );
    }

    if (sanitizedText.length > 2000) {
      return NextResponse.json(
        { error: "Comment is too long (max 2000 characters)" },
        { status: 400 },
      );
    }

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
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        text: sanitizedText,
        postId,
        userId: user.id,
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
    });

    // Create notification for post owner
    await createNotification({
      type: "COMMENT",
      userId: post.userId,
      actorId: user.id,
      message: `${user.username || user.name || "Someone"} commented on your post`,
      postId: postId,
      commentId: comment.id,
    });

    // Return with rate limit headers
    return NextResponse.json(comment, { headers });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
