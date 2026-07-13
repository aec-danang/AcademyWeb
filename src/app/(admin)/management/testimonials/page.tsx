import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import TestimonialsClient from "./TestimonialsClient";

export const metadata: Metadata = {
  title: "Manage Testimonials | Admin Dashboard",
};

export default async function TestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { order: 'asc' }
  });

  return (
    <div className="p-6">
      <TestimonialsClient initialTestimonials={testimonials} />
    </div>
  );
}
