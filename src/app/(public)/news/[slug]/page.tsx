import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await prisma.post.findUnique({
    where: { slug: resolvedParams.slug },
  });

  if (!post || post.type !== 'news' || !post.published) {
    return {
      title: 'Post Not Found | Academy',
    };
  }

  return {
    title: post.metaTitle || `${post.title} | Academy News`,
    description: post.metaDescription || post.excerpt || `Read ${post.title} at Academy English Center.`,
  };
}

export default async function NewsPostPage({ params }: Props) {
  const resolvedParams = await params;
  const post = await prisma.post.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      author: true,
    },
  });

  if (!post || post.type !== 'news' || !post.published) {
    notFound();
  }

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/news" className="inline-flex items-center text-orange-600 hover:text-orange-700 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Back to News
        </Link>
      </div>

      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center text-gray-500 text-sm">
            <span>{post.createdAt.toLocaleDateString()}</span>
            {post.author && (
              <>
                <span className="mx-2">•</span>
                <span>By {post.author.name || 'Academy Staff'}</span>
              </>
            )}
          </div>
        </header>

        {post.featuredImage && (
          <div className="mb-8">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full max-h-[500px] object-cover rounded-xl shadow-sm"
            />
          </div>
        )}

        <div 
          className="prose prose-lg max-w-none text-gray-800"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
}
