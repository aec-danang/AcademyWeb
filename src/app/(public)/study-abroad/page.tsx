import { Metadata } from 'next';
import TestimonialsSection from "@/components/TestimonialsSection";
import FaqSection from "@/components/FaqSection";

export const metadata: Metadata = {
  title: 'Study Abroad & Summer Camp | Academy',
  description: 'Learn more about Study Abroad & Summer Camp at Academy English Center.',
};

export default function StudyAbroadPage() {
  return (
    <>
      <div className="min-h-screen p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Study Abroad & Summer Camp</h1>
        <p>Welcome to the Study Abroad & Summer Camp page. Content coming soon!</p>
      </div>
      
      <TestimonialsSection />
      <FaqSection />
    </>
  );
}
