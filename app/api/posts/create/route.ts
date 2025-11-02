import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthAndRateLimit, sanitizeInput } from "@/lib/api-protection";

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
    const { imageUrl, caption } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 },
      );
    }

    // Sanitize caption to prevent XSS
    const sanitizedCaption = caption ? sanitizeInput(caption) : null;

    // Validate caption length
    if (sanitizedCaption && sanitizedCaption.length > 2200) {
      return NextResponse.json(
        { error: "Caption must be less than 2200 characters" },
        { status: 400 },
      );
    }

    const post = await prisma.post.create({
      data: {
        imageUrl,
        caption: sanitizedCaption,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, post }, { headers });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
