import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CalendarDays, User } from 'lucide-react';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await prisma.post.findUnique({
    where: { slug: resolvedParams.slug },
  });

  if (!post || post.type !== 'post' || !post.published) {
    return {
      title: 'Post Not Found | Academy',
    };
  }

  return {
    title: post.metaTitle || `${post.title} | Academy Blog`,
    description: post.metaDescription || post.excerpt || `Read ${post.title} at Academy English Center.`,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const resolvedParams = await params;
  const post = await prisma.post.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      author: true,
    },
  });

  if (!post || post.type !== 'post' || !post.published) {
    notFound();
  }

  const dateStr = post.createdAt.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-navy-light">
      {/* Hero */}
      {post.featuredImage ? (
        <div className="relative w-full h-[420px] md:h-[520px] overflow-hidden">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            priority
            style={{ objectFit: 'cover' }}
            className="brightness-75"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/30 to-transparent" />

          {/* Back link */}
          <div className="absolute top-8 left-0 right-0 container mx-auto px-6">
            <Link
              href="/posts"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white font-semibold text-sm transition-colors group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Trở về Blog
            </Link>
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 container mx-auto px-6 pb-10">
            <div className="max-w-3xl">
              <div className="flex items-center gap-4 text-white/70 text-sm mb-4 font-semibold">
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={15} />
                  {dateStr}
                </span>
                {post.author && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/40" />
                    <span className="flex items-center gap-1.5">
                      <User size={15} />
                      {post.author.name || 'Academy Staff'}
                    </span>
                  </>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white font-montserrat leading-tight">
                {post.title}
              </h1>
            </div>
          </div>
        </div>
      ) : (
        /* No featured image – plain header */
        <div className="bg-white border-b border-gray-100 pt-32 pb-12">
          <div className="container mx-auto px-6 max-w-3xl">
            <Link
              href="/posts"
              className="inline-flex items-center gap-2 text-orange hover:text-orange-hover font-semibold text-sm transition-colors group mb-8"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Trở về Blog
            </Link>
            <div className="flex items-center gap-4 text-navy/50 text-sm mb-4 font-semibold">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={15} />
                {dateStr}
              </span>
              {post.author && (
                <>
                  <span className="w-1 h-1 rounded-full bg-navy/20" />
                  <span className="flex items-center gap-1.5">
                    <User size={15} />
                    {post.author.name || 'Academy Staff'}
                  </span>
                </>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-navy font-montserrat leading-tight">
              {post.title}
            </h1>
          </div>
        </div>
      )}

      {/* Article Body */}
      <div className="container mx-auto px-6 max-w-3xl py-14">
        {/* Back link when image hero is shown */}
        {post.featuredImage && (
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 text-orange hover:text-orange-hover font-semibold text-sm transition-colors group mb-10"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Trở về Blog
          </Link>
        )}

        {/* Excerpt callout */}
        {post.excerpt && (
          <p className="text-lg text-navy/70 font-medium leading-relaxed border-l-4 border-orange pl-5 mb-10 italic">
            {post.excerpt}
          </p>
        )}

        <article
          className="prose prose-lg max-w-none
            prose-headings:font-montserrat prose-headings:text-navy prose-headings:font-bold
            prose-p:text-navy/80 prose-p:leading-relaxed
            prose-a:text-orange prose-a:no-underline hover:prose-a:text-orange-hover
            prose-strong:text-navy
            prose-img:rounded-xl prose-img:shadow-sm
            prose-blockquote:border-l-orange prose-blockquote:text-navy/70
            prose-code:text-orange prose-code:bg-orange-light prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
          "
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Footer divider */}
        <div className="mt-14 pt-8 border-t border-gray-200 flex items-center justify-between">
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 text-orange hover:text-orange-hover font-bold text-sm uppercase tracking-wider transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Tất cả bài viết
          </Link>
          <span className="text-navy/40 text-sm">{dateStr}</span>
        </div>
      </div>
    </div>
  );
}
