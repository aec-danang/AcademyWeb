import TestimonialsSection from "@/components/TestimonialsSection";
import FaqSection from "@/components/FaqSection";
import { prisma } from "@/lib/prisma";
import ProgramsClient from "./ProgramsClient";

export default async function ProgramsPage() {
  const programs = await prisma.siteProgram.findMany({
    where: { published: true },
    orderBy: { order: 'asc' }
  });

  return (
    <>
      <ProgramsClient programs={programs} />
      <TestimonialsSection />
      <FaqSection />
    </>
  );
}
