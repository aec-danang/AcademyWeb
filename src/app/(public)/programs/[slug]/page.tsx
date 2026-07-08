import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TestimonialsSection from "@/components/TestimonialsSection";
import FaqSection from "@/components/FaqSection";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const program = await prisma.siteProgram.findUnique({
    where: { slug }
  });

  if (!program) {
    return { title: "Program Not Found" };
  }

  return {
    title: `${program.title} | Academy English Center`,
    description: program.description || `Learn more about ${program.title} at AEC.`,
  };
}

export default async function ProgramDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const program = await prisma.siteProgram.findUnique({
    where: { slug }
  });

  if (!program || !program.published) {
    notFound();
  }

  return (
    <>
      <div className="container" style={{ padding: "80px 24px", minHeight: "60vh" }}>
        <Link href="/programs" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--color-navy)", fontWeight: 600, textDecoration: "none", marginBottom: "32px" }}>
          <ArrowLeft size={16} /> Back to Programs
        </Link>
        <h1 style={{ fontSize: "var(--text-4xl)", marginBottom: "24px", color: "var(--color-orange)" }}>
          {program.title}
        </h1>
        {program.description && (
          <p style={{ fontSize: "var(--text-lg)", color: "var(--text-muted)", marginBottom: "48px" }}>
            {program.description}
          </p>
        )}

        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: program.content || "<p>More information coming soon.</p>" }}
        />
      </div>

      <TestimonialsSection />
      <FaqSection />
    </>
  );
}
