import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PostView } from "@/components/post-view";

interface PageProps {
  params: Promise<{
    postId: string;
  }>;
}

async function getPost(postId: string, userId?: string) {
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: {
      user: true,
      likes: userId
        ? {
            where: {
              userId: userId,
            },
          }
        : false,
      comments: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  if (!post) {
    return null;
  }

  return {
    ...post,
    isLiked: userId ? (post.likes as any[]).length > 0 : false,
    likesCount: post._count.likes,
    commentsCount: post._count.comments,
  } as any;
}

export default async function PostPage({ params }: PageProps) {
  const { postId } = await params;
  const session = await getServerSession(authOptions);

  const post = await getPost(postId, session?.user?.id);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="mx-auto max-w-6xl px-4 py-4 md:py-6">
        <PostView post={post} />
      </div>
    </div>
  );
}
