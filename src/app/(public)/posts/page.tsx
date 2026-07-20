import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { CalendarDays, ArrowRight, BookOpen } from 'lucide-react';

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
  });

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
        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-orange-light rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="text-orange w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-navy mb-2 font-montserrat">Chưa có bài viết nào</h3>
            <p className="text-navy/60">Chúng tôi đang chuẩn bị những bài viết thú vị. Vui lòng quay lại sau nhé!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post) => (
              <Link key={post.slug} href={`/posts/${post.slug}`} className="group flex flex-col lg:flex-row bg-white rounded-2xl shadow-sm hover:shadow-card transition-all duration-300 overflow-hidden border border-gray-100">
                {post.featuredImage && (
                  <div className="relative w-full lg:w-2/5 h-56 lg:h-auto overflow-hidden shrink-0">
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-6 lg:p-8 flex flex-col justify-center flex-grow">
                  <div className="flex items-center gap-2 text-sm text-navy/50 mb-3 font-semibold">
                    <CalendarDays size={16} />
                    <span>{post.createdAt.toLocaleDateString('vi-VN')}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-navy group-hover:text-orange transition-colors line-clamp-2 font-montserrat">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-navy/70 mb-4 line-clamp-3 lg:line-clamp-2 text-sm leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="mt-auto flex items-center font-bold text-orange text-sm tracking-wider uppercase transition-all">
                    Xem chi tiết <ArrowRight size={16} className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
