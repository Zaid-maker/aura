import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthAndRateLimit } from "@/lib/api-protection";

/**
 * DELETE /api/user/delete
 * Delete user account and all associated data
 */
export async function DELETE(req: NextRequest) {
  try {
    const protection = await withAuthAndRateLimit(req, "sensitive");
    if (!protection.success) {
      return protection.response;
    }

    const { session, headers } = protection;

    // Delete user and all associated data (cascade delete)
    await prisma.user.delete({
      where: { id: session.user.id },
    });

    return NextResponse.json(
      { message: "Account deleted successfully" },
      { headers }
    );
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
