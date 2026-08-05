import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, CalendarDays, Clock, User, ArrowLeft, ArrowRight, Tag } from 'lucide-react';
import { ReadingProgress } from './ReadingProgress';
import { TableOfContents } from './TableOfContents';
import { ShareButtons } from './ShareButtons';
import { processHtmlAndGetToc } from './processHtml';
import { cn } from '@/lib/utils';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await prisma.post.findUnique({
    where: { slug: resolvedParams.slug },
  });

  if (!post || post.type !== 'post' || !post.published) {
    return { title: 'Post Not Found | Academy' };
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
    include: { author: true },
  });

  if (!post || post.type !== 'post' || !post.published) {
    notFound();
  }

  // Get reading time and TOC
  const { processedHtml, toc, readingTimeMinutes } = processHtmlAndGetToc(post.content);

  // Date formatting
  const dateStr = post.createdAt.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Fetch Related Posts
  let relatedPosts = [];
  if (post.categories && post.categories.length > 0) {
    relatedPosts = await prisma.post.findMany({
      where: {
        type: 'post',
        published: true,
        id: { not: post.id },
        categories: { hasSome: post.categories },
      },
      take: 3,
      orderBy: { createdAt: 'desc' },
    });
  } else {
    relatedPosts = await prisma.post.findMany({
      where: { type: 'post', published: true, id: { not: post.id } },
      take: 3,
      orderBy: { createdAt: 'desc' },
    });
  }

  // Fetch Prev/Next Posts
  const prevPost = await prisma.post.findFirst({
    where: { type: 'post', published: true, createdAt: { lt: post.createdAt } },
    orderBy: { createdAt: 'desc' },
  });
  const nextPost = await prisma.post.findFirst({
    where: { type: 'post', published: true, createdAt: { gt: post.createdAt } },
    orderBy: { createdAt: 'asc' },
  });

  const category = post.categories?.[0] || 'Uncategorized';

  return (
    <div className="min-h-screen bg-white">
      <ReadingProgress />

      {/* Semantic Layout */}
      <article className="pt-24 pb-16 md:pt-32 md:pb-24">
        <header className="container mx-auto px-6 max-w-4xl mb-12">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center text-sm text-navy/60 font-semibold mb-8">
            <Link href="/" className="hover:text-orange transition-colors">Trang chủ</Link>
            <ChevronRight size={14} className="mx-2 opacity-50" />
            <Link href="/posts" className="hover:text-orange transition-colors">Blog</Link>
            <ChevronRight size={14} className="mx-2 opacity-50" />
            <span className="text-orange uppercase tracking-wide">{category}</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-extrabold text-navy font-montserrat leading-tight mb-6">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-xl md:text-2xl text-navy/70 leading-relaxed font-medium mb-8">
              {post.excerpt}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-y-4 gap-x-6 text-sm font-medium text-navy/60 border-t border-b border-gray-100 py-4 mb-10">
            {post.author && (
              <div className="flex items-center gap-2">
                <User size={16} className="text-orange" />
                <span className="text-navy">{post.author.name || 'Academy Staff'}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-orange" />
              <span>{dateStr}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-orange" />
              <span>{readingTimeMinutes} phút đọc</span>
            </div>
          </div>

          {/* Featured Image */}
          {post.featuredImage && (
            <figure className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden shadow-sm mb-12">
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                priority
                style={{ objectFit: 'cover' }}
              />
            </figure>
          )}
        </header>

        {/* Main Content Area */}
        <div className="container mx-auto px-6 flex justify-center gap-12 lg:gap-24 relative">
          
          <main className="w-full max-w-[760px] shrink-0">
            {/* Markdown/HTML Content */}
            <section
              suppressHydrationWarning
              className="prose prose-lg md:prose-xl max-w-none
                prose-headings:font-montserrat prose-headings:font-bold prose-headings:text-navy
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:border-gray-100 prose-h2:pb-4
                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:text-navy/80 prose-p:leading-[1.8] prose-p:mb-8
                prose-a:text-orange prose-a:no-underline hover:prose-a:text-orange-hover prose-a:font-semibold
                prose-strong:text-navy
                prose-ul:text-navy/80 prose-ul:leading-[1.8]
                prose-ol:text-navy/80 prose-ol:leading-[1.8]
                prose-li:my-2
                prose-img:rounded-2xl prose-img:shadow-sm prose-img:w-full prose-img:my-10
                prose-blockquote:border-l-4 prose-blockquote:border-orange prose-blockquote:bg-orange/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:text-navy/70 prose-blockquote:italic prose-blockquote:my-10
                prose-code:text-orange prose-code:bg-orange-light prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
              "
              dangerouslySetInnerHTML={{ __html: processedHtml }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 flex flex-wrap items-center gap-3">
                <Tag size={18} className="text-navy/40" />
                {post.tags.map((tag: any) => (
                  <span key={tag} className="px-3 py-1 bg-gray-50 text-navy/70 rounded-full text-sm font-semibold tracking-wide border border-gray-100 hover:bg-orange hover:text-white hover:border-orange transition-colors cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Share */}
            <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
              <ShareButtons url={`/posts/${post.slug}`} title={post.title} />
            </div>

            {/* Prev/Next Navigation */}
            <nav className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6" aria-label="Pagination">
              {prevPost ? (
                <Link href={`/posts/${prevPost.slug}`} className="group flex flex-col p-6 rounded-2xl border border-gray-100 bg-white hover:border-orange/30 hover:shadow-card transition-all">
                  <span className="flex items-center text-xs font-bold text-navy/40 uppercase tracking-widest mb-3">
                    <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Bài trước
                  </span>
                  <span className="font-montserrat font-bold text-navy group-hover:text-orange line-clamp-2 leading-snug">
                    {prevPost.title}
                  </span>
                </Link>
              ) : <div />}
              {nextPost && (
                <Link href={`/posts/${nextPost.slug}`} className="group flex flex-col p-6 rounded-2xl border border-gray-100 bg-white hover:border-orange/30 hover:shadow-card transition-all text-right items-end">
                  <span className="flex items-center text-xs font-bold text-navy/40 uppercase tracking-widest mb-3">
                    Bài tiếp theo <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="font-montserrat font-bold text-navy group-hover:text-orange line-clamp-2 leading-snug">
                    {nextPost.title}
                  </span>
                </Link>
              )}
            </nav>
          </main>

          {/* Table of Contents Sidebar */}
          <aside className="hidden xl:block w-[280px] shrink-0">
            <TableOfContents items={toc} />
          </aside>
          
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-navy-light py-20">
          <div className="container mx-auto px-6 max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-navy font-montserrat mb-12 text-center">
              Bài viết liên quan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((rp: any) => (
                <Link key={rp.id} href={`/posts/${rp.slug}`} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-card transition-all h-full">
                  <div className="relative aspect-video overflow-hidden">
                    {rp.featuredImage ? (
                      <Image 
                        src={rp.featuredImage} 
                        alt={rp.title} 
                        fill 
                        style={{ objectFit: 'cover' }} 
                        className="group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400 font-montserrat font-semibold">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <span className="text-xs font-bold text-orange uppercase tracking-wider mb-2">
                      {rp.categories?.[0] || 'Uncategorized'}
                    </span>
                    <h3 className="text-lg font-bold text-navy font-montserrat leading-snug group-hover:text-orange transition-colors mb-3 line-clamp-2">
                      {rp.title}
                    </h3>
                    <p className="text-sm text-navy/60 line-clamp-2 mb-4 flex-1">
                      {rp.excerpt || 'Đọc chi tiết bài viết...'}
                    </p>
                    <span className="text-xs font-semibold text-navy/40 flex items-center gap-1.5 mt-auto">
                      <CalendarDays size={14} />
                      {rp.createdAt.toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
