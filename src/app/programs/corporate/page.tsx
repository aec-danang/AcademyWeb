import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Corporate English | Academy',
  description: 'Learn more about Corporate English at Academy English Center.',
};

export default function CorporatePage() {
  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Corporate English</h1>
      <p>Welcome to the Corporate English page. Content coming soon!</p>
    </div>
  );
}
