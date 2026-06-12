import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'English for Kids | Academy',
  description: 'Learn more about English for Kids at Academy English Center.',
};

export default function KidsPage() {
  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">English for Kids</h1>
      <p>Welcome to the English for Kids page. Content coming soon!</p>
    </div>
  );
}
