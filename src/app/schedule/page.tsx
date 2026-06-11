import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Opening Schedule | Academy',
  description: 'Learn more about Opening Schedule at Academy English Center.',
};

export default function SchedulePage() {
  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Opening Schedule</h1>
      <p>Welcome to the Opening Schedule page. Content coming soon!</p>
    </div>
  );
}
