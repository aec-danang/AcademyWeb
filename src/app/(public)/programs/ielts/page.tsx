import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IELTS Preparation | Academy',
  description: 'Learn more about IELTS Preparation at Academy English Center.',
};

export default function IeltsPage() {
  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">IELTS Preparation</h1>
      <p>Welcome to the IELTS Preparation page. Content coming soon!</p>
    </div>
  );
}
