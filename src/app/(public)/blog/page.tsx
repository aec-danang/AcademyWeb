import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Card from '@/lib/ui/Card';

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
    <div className="min-h-screen p-8 max-w-5xl mx-auto">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Our Blog</h1>
        <p className="text-lg text-gray-600">Insights, tips, and stories from our English learning community.</p>
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-gray-500">No blog posts available at the moment. Please check back later!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="block text-inherit no-underline hover:opacity-90 transition-opacity">
              <Card className="h-full flex flex-col p-6 hover:shadow-lg transition-shadow">
                {post.featuredImage && (
                  <div className="mb-4 -mx-6 -mt-6">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-48 object-cover rounded-t-lg"
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
