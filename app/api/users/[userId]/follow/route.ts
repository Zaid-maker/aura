import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { withAuthAndRateLimit } from "@/lib/api-protection";
import { createNotification } from "@/lib/notifications";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    // Apply authentication and rate limiting
    const protection = await withAuthAndRateLimit(req, "mutation");
    if (!protection.success) {
      return protection.response;
    }

    // TypeScript now knows protection has session and headers
    const { session, headers } = protection;
    const { userId } = await params;

    if (session.user?.id === userId) {
      return NextResponse.json(
        { error: "You cannot follow yourself" },
        { status: 400 },
      );
    }

    // Check if user exists
    const userToFollow = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToFollow) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id!,
          followingId: userId,
        },
      },
    });

    if (existingFollow) {
      return NextResponse.json(
        { error: "Already following this user" },
        { status: 400 },
      );
    }

    // Create follow relationship
    await prisma.follow.create({
      data: {
        followerId: session.user.id!,
        followingId: userId,
      },
    });

    // Create notification for the user being followed
    await createNotification({
      type: "FOLLOW",
      userId: userId,
      actorId: session.user.id!,
      message: `${session.user.username || session.user.name || "Someone"} started following you`,
    });

    return NextResponse.json({ success: true }, { headers });
  } catch (error) {
    console.error("Follow error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    // Apply authentication and rate limiting
    const protection = await withAuthAndRateLimit(req, "mutation");
    if (!protection.success) {
      return protection.response;
    }

    // TypeScript now knows protection has session and headers
    const { session, headers } = protection;
    const { userId } = await params;

    // Check if follow relationship exists
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id!,
          followingId: userId,
        },
      },
    });

    if (!existingFollow) {
      return NextResponse.json(
        { error: "You are not following this user" },
        { status: 400 },
      );
    }

    // Delete follow relationship
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: session.user.id!,
          followingId: userId,
        },
      },
    });

    return NextResponse.json({ success: true }, { headers });
  } catch (error) {
    console.error("Unfollow error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
