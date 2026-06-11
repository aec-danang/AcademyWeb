import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Test Prep (TOEFL, TOEIC, SAT) | Academy',
  description: 'Learn more about Test Prep (TOEFL, TOEIC, SAT) at Academy English Center.',
};

export default function TestprepPage() {
  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Test Prep (TOEFL, TOEIC, SAT)</h1>
      <p>Welcome to the Test Prep (TOEFL, TOEIC, SAT) page. Content coming soon!</p>
    </div>
  );
}
