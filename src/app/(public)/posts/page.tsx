import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { BookOpen } from 'lucide-react';
import BlogListClient from './BlogListClient';

export const metadata: Metadata = {
  title: 'Blog | Academy',
  description: 'Read the latest blog posts from Academy English Center.',
};

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: {
      type: 'post',
      published: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      featuredImage: true,
      createdAt: true,
    },
  });

  // Serialize dates for client component
  const serialized = posts.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() }));

  return (
    <div className="min-h-screen bg-navy-light pt-32 pb-24">
      {/* Hero Section */}
      <div className="container mx-auto px-6 mb-16 text-center">
        <div className="inline-flex items-center justify-center gap-2 bg-white px-5 py-2 rounded-full shadow-sm mb-6 text-orange font-semibold text-sm">
          <BookOpen size={18} />
          <span>Academy Blog</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-navy mb-6 font-montserrat">
          Khám phá <span className="text-orange">Tri thức</span>
        </h1>
        <p className="text-lg text-navy/70 max-w-2xl mx-auto">
          Những góc nhìn, mẹo học tiếng Anh và câu chuyện thú vị từ cộng đồng Academy.
        </p>
      </div>

      <div className="container mx-auto px-6 max-w-5xl">
        <BlogListClient posts={serialized} />
      </div>
    </div>
  );
}
