import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PostEditorClient from "../../components/PostEditorClient";

export const metadata = {
  title: "Edit Post | Admin",
};

export default async function EditPostPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  
  const post = await prisma.post.findUnique({
    where: { slug },
  });

  if (!post) {
    notFound();
  }

  return <PostEditorClient initialData={post} />;
}
