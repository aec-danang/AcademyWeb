import { prisma } from "@/lib/prisma";
import PostsClient from "./PostsClient";

export default async function AdminPosts() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <PostsClient initialPosts={posts} />;
}
