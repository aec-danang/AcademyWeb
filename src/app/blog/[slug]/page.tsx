import { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `Blog Post: ${resolvedParams.slug} | Academy`,
    description: 'Read our latest blog post on Academy English Center.',
  };
}

export default async function BlogPostPage({ params }: Props) {
  const resolvedParams = await params;
  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Blog Post: {resolvedParams.slug}</h1>
      <p>This is a dynamically generated blog post page.</p>
    </div>
  );
}
