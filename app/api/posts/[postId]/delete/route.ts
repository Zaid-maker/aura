import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UTApi } from "uploadthing/server";
import { withAuthAndRateLimit } from "@/lib/api-protection";

const utapi = new UTApi();

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    // Apply authentication and rate limiting (sensitive operation)
    const protection = await withAuthAndRateLimit(req, "sensitive");
    if (!protection.success) {
      return protection.response;
    }

    // TypeScript now knows protection has session and headers
    const { session, headers } = protection;
    const { postId } = await params;

    // Find the post and verify ownership
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        userId: true,
        imageUrl: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if the user owns the post
    if (post.userId !== session.user?.id) {
      return NextResponse.json(
        { error: "You can only delete your own posts" },
        { status: 403 },
      );
    }

    // Extract the file key from the UploadThing URL
    // URL format: https://utfs.io/f/{fileKey}
    const fileKey = post.imageUrl.split("/f/")[1];

    // Delete the post from database (cascade will delete likes, comments, etc.)
    await prisma.post.delete({
      where: { id: postId },
    });

    // Delete the image from UploadThing
    if (fileKey) {
      try {
        await utapi.deleteFiles(fileKey);
      } catch (error) {
        console.error("Error deleting file from UploadThing:", error);
        // Continue even if file deletion fails
      }
    }

    return NextResponse.json({ message: "Post deleted successfully" }, { headers });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
