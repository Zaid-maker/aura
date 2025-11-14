import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/admin/reports - Get all reports (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // PENDING, UNDER_REVIEW, RESOLVED, DISMISSED
    const type = searchParams.get("type"); // POST, COMMENT, USER

    // Parse and validate page parameter
    const pageParam = searchParams.get("page");
    const parsedPage = pageParam ? parseInt(pageParam, 10) : 1;
    if (pageParam && (!Number.isFinite(parsedPage) || parsedPage < 1)) {
      return NextResponse.json(
        { error: "Invalid page parameter. Must be a positive integer." },
        { status: 400 },
      );
    }
    const page = Math.max(1, parsedPage);

    // Parse and validate limit parameter
    const limitParam = searchParams.get("limit");
    const parsedLimit = limitParam ? parseInt(limitParam, 10) : 20;
    if (limitParam && (!Number.isFinite(parsedLimit) || parsedLimit < 1)) {
      return NextResponse.json(
        { error: "Invalid limit parameter. Must be a positive integer." },
        { status: 400 },
      );
    }
    const limit = Math.min(100, Math.max(1, parsedLimit)); // Clamp between 1 and 100

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (type) {
      where.type = type;
    }

    // Get total count for pagination
    const total = await prisma.report.count({ where });

    // Fetch reports with related data
    const reports = await prisma.report.findMany({
      where,
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
