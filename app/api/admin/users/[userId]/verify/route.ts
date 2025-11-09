import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthAndRateLimit } from "@/lib/api-protection";
import { Prisma } from "@prisma/client";

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

    // Check if session exists and has user
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Authentication required." },
        { status: 401, headers }
      );
    }

    // Only admins can verify users
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Only administrators can verify users." },
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
    try {
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
    } catch (updateError) {
      // Handle user not found error
      if (
        updateError instanceof Prisma.PrismaClientKnownRequestError &&
        updateError.code === "P2025"
      ) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404, headers }
        );
      }
      // Rethrow other errors to be caught by outer catch
      throw updateError;
    }
  } catch (error) {
    console.error("Error updating verification status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
