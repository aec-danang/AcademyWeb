import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Public Speaking & Skills | Academy',
  description: 'Learn more about Public Speaking & Skills at Academy English Center.',
};

export default function PublicSpeakingPage() {
  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Public Speaking & Skills</h1>
      <p>Welcome to the Public Speaking & Skills page. Content coming soon!</p>
    </div>
  );
}
