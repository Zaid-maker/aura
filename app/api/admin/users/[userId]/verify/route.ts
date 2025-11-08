import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthAndRateLimit } from "@/lib/api-protection";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Apply authentication and rate limiting
    const protection = await withAuthAndRateLimit(req, "mutation");
    if (!protection.success) {
      return protection.response;
    }

    const { session, headers } = protection;
    const { userId } = await params;

    // TODO: Add admin role check here
    // For now, users can only verify themselves (for testing)
    // In production, only admins should be able to verify users
    if (session.user.id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized. Only admins can verify users." },
        { status: 403, headers }
      );
    }

    const body = await req.json();
    const { verified } = body;

    if (typeof verified !== "boolean") {
      return NextResponse.json(
        { error: "Invalid verification status" },
        { status: 400, headers }
      );
    }

    // Update user verification status
    const user = await prisma.user.update({
      where: { id: userId },
      data: { verified },
      select: {
        id: true,
        username: true,
        name: true,
        verified: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        user,
        message: verified
          ? "User verified successfully"
          : "User verification removed",
      },
      { headers }
    );
  } catch (error) {
    console.error("Error updating verification status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
