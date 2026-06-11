import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Basic & Communicative English | Academy',
  description: 'Learn more about Basic & Communicative English at Academy English Center.',
};

export default function CommunicationPage() {
  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Basic & Communicative English</h1>
      <p>Welcome to the Basic & Communicative English page. Content coming soon!</p>
    </div>
  );
}
