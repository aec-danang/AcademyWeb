import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { CalendarDays } from 'lucide-react';
import NewsListClient from './NewsListClient';

export const metadata: Metadata = {
  title: 'News & Events | Academy',
  description: 'Learn more about News & Events at Academy English Center.',
};

export default async function NewsPage() {
  const posts = await prisma.post.findMany({
    where: {
      type: {
        in: ['news', 'event'],
      },
      published: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      slug: true,
      title: true,
      type: true,
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
        <h1 className="text-4xl md:text-5xl font-extrabold text-navy mb-6 font-montserrat">
          Tin tức &amp; <span className="text-orange">Sự kiện</span>
        </h1>
        <p className="text-lg text-navy/70 max-w-2xl mx-auto">
          Cập nhật những thông tin mới nhất và các sự kiện hấp dẫn tại Academy English Center.
        </p>
      </div>

      <div className="container mx-auto px-6">
        <NewsListClient posts={serialized} />
      </div>
    </div>
  );
}
