import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { CalendarDays, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'News & Events | Academy',
  description: 'Learn more about News & Events at Academy English Center.',
};

export default async function NewsPage() {
  const posts = await prisma.post.findMany({
    where: {
      type: {
        in: ['news', 'event']
      },
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
        <h1 className="text-4xl md:text-5xl font-extrabold text-navy mb-6 font-montserrat">
          Tin tức & <span className="text-orange">Sự kiện</span>
        </h1>
        <p className="text-lg text-navy/70 max-w-2xl mx-auto">
          Cập nhật những thông tin mới nhất và các sự kiện hấp dẫn tại Academy English Center.
        </p>
      </div>

      <div className="container mx-auto px-6">
        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-orange-light rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarDays className="text-orange w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-navy mb-2 font-montserrat">Chưa có bài viết nào</h3>
            <p className="text-navy/60">Chúng tôi đang cập nhật tin tức. Vui lòng quay lại sau nhé!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link key={post.slug} href={`/news/${post.slug}`} className="group h-full flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-card transition-all duration-300 overflow-hidden border border-gray-100">
                {post.featuredImage ? (
                  <div className="relative w-full h-56 overflow-hidden">
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="w-full h-56 bg-orange-light flex items-center justify-center">
                    <span className="text-orange font-bold text-xl opacity-30">AEC</span>
                  </div>
                )}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 text-sm text-navy/50 mb-3 font-semibold">
                    <CalendarDays size={16} />
                    <span>{post.createdAt.toLocaleDateString('vi-VN')}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-navy group-hover:text-orange transition-colors line-clamp-2 font-montserrat">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-navy/70 mb-6 flex-grow line-clamp-3 text-sm leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="mt-auto flex items-center font-bold text-orange text-sm uppercase tracking-wider transition-all">
                    Đọc tiếp <ArrowRight size={16} className="ml-1 opacity-80 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
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
