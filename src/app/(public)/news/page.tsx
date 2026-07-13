import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import Card from '@/lib/ui/Card';

export const metadata: Metadata = {
  title: 'News & Events | Academy',
  description: 'Learn more about News & Events at Academy English Center.',
};

export default async function NewsPage() {
  const posts = await prisma.post.findMany({
    where: {
      type: 'news',
      published: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">News & Events</h1>
        <p className="text-lg text-gray-600">Stay updated with the latest happenings at Academy English Center.</p>
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-gray-500">No news articles available at the moment. Please check back later!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/news/${post.slug}`} className="block text-inherit no-underline hover:opacity-90 transition-opacity">
              <Card className="h-full flex flex-col p-6 hover:shadow-lg transition-shadow">
                {post.featuredImage && (
                  <div className="relative w-full h-48 mb-4 -mx-6 -mt-6">
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="rounded-t-lg"
                    />
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2 text-orange-600">{post.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{post.createdAt.toLocaleDateString()}</p>
                {post.excerpt && <p className="text-gray-700 flex-grow">{post.excerpt}</p>}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
