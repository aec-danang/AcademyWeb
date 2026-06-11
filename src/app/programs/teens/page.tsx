import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'English for Teens | Academy',
  description: 'Learn more about English for Teens at Academy English Center.',
};

export default function TeensPage() {
  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">English for Teens</h1>
      <p>Welcome to the English for Teens page. Content coming soon!</p>
    </div>
  );
}
