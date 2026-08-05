import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import NewsListClient from './NewsListClient';
import GsapReveal from '@/components/animations/GsapReveal';

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
  const serialized = posts.map((p: any) => ({ ...p, createdAt: p.createdAt.toISOString() }));

  return (
    <div className="bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-navy text-white pt-32 pb-32">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-0 -left-1/4 w-1/2 h-full bg-orange blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-blue-500 blur-[100px] rounded-full mix-blend-screen" />
        </div>
        
        <GsapReveal className="container relative z-10 max-w-4xl mx-auto text-center px-4" target=".gsap-target > *">
          <div className="gsap-target">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Tin tức &amp; <span className="text-orange">Sự kiện</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Cập nhật những thông tin mới nhất và các sự kiện hấp dẫn tại Academy English Center.
            </p>
          </div>
        </GsapReveal>
        
        {/* Decorative wave at the bottom */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
          <svg className="relative block w-full h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.06,155.24,124.59,240,105.7,269.45,99.19,295.6,90,321.39,56.44Z" className="fill-white dark:fill-slate-950"></path>
          </svg>
        </div>
      </section>

      <section className="py-20 relative -mt-10">
        <GsapReveal className="container mx-auto px-4 max-w-7xl" target=".group" delay={0.2}>
          <NewsListClient posts={serialized} />
        </GsapReveal>
      </section>
    </div>
  );
}
