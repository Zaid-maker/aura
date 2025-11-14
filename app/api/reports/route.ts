import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthAndRateLimit, sanitizeInput } from "@/lib/api-protection";

// POST /api/reports - Create a new report
export async function POST(req: NextRequest) {
  try {
    // Apply authentication and rate limiting
    const protection = await withAuthAndRateLimit(req, "mutation");
    if (!protection.success) {
      return protection.response;
    }

    const { session, headers } = protection;

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { type, reason, description, postId, commentId, reportedUserId } =
      body;

    // Validate report type
    const validTypes = ["POST", "COMMENT", "USER"];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid report type" },
        { status: 400, headers },
      );
    }

    // Validate report reason
    const validReasons = [
      "SPAM",
      "HARASSMENT",
      "HATE_SPEECH",
      "VIOLENCE",
      "NUDITY",
      "SELF_HARM",
      "FALSE_INFORMATION",
      "BULLYING",
      "INTELLECTUAL_PROPERTY",
      "OTHER",
    ];
    if (!reason || !validReasons.includes(reason)) {
      return NextResponse.json(
        { error: "Invalid report reason" },
        { status: 400, headers },
      );
    }

    // Validate that at least one content reference is provided
    if (!postId && !commentId && !reportedUserId) {
      return NextResponse.json(
        {
          error: "Report must reference a post, comment, or user",
        },
        { status: 400, headers },
      );
    }

    // Validate that only one content reference is provided
    const contentReferences = [postId, commentId, reportedUserId].filter(
      Boolean,
    );
    if (contentReferences.length > 1) {
      return NextResponse.json(
        { error: "Report can only reference one type of content" },
        { status: 400, headers },
      );
    }

    // Verify the reported content exists
    if (postId) {
      const post = await prisma.post.findUnique({
        where: { id: postId },
      });
      if (!post) {
        return NextResponse.json(
          { error: "Post not found" },
          { status: 404, headers },
        );
      }
    }

    if (commentId) {
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
      });
      if (!comment) {
        return NextResponse.json(
          { error: "Comment not found" },
          { status: 404, headers },
        );
      }
    }

    if (reportedUserId) {
      const reportedUser = await prisma.user.findUnique({
        where: { id: reportedUserId },
      });
      if (!reportedUser) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404, headers },
        );
      }

      // Prevent users from reporting themselves
      if (reportedUserId === user.id) {
        return NextResponse.json(
          { error: "You cannot report yourself" },
          { status: 400, headers },
        );
      }
    }

    // Check for duplicate reports (same user, same content, pending status)
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: user.id,
        type,
        status: {
          in: ["PENDING", "UNDER_REVIEW"],
        },
        ...(postId && { postId }),
        ...(commentId && { commentId }),
        ...(reportedUserId && { reportedUserId }),
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: "You have already reported this content" },
        { status: 400, headers },
      );
    }

    // Sanitize description
    const sanitizedDescription = description
      ? sanitizeInput(description)
      : null;

    // Validate description length
    if (sanitizedDescription && sanitizedDescription.length > 1000) {
      return NextResponse.json(
        { error: "Description is too long (max 1000 characters)" },
        { status: 400, headers },
      );
    }

    // Create the report
    const report = await prisma.report.create({
      data: {
        type,
        reason,
        description: sanitizedDescription,
        reporterId: user.id,
        ...(postId && { postId }),
        ...(commentId && { commentId }),
        ...(reportedUserId && { reportedUserId }),
      },
    });

    return NextResponse.json(
      {
        message: "Report submitted successfully",
        report: {
          id: report.id,
          type: report.type,
          reason: report.reason,
          status: report.status,
        },
      },
      { status: 201, headers },
    );
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
