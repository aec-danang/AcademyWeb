import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'News & Events | Academy',
  description: 'Learn more about News & Events at Academy English Center.',
};

export default function NewsPage() {
  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">News & Events</h1>
      <p>Welcome to the News & Events page. Content coming soon!</p>
    </div>
  );
}
