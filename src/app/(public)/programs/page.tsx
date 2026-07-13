import TestimonialsSection from "@/components/TestimonialsSection";
import FaqSection from "@/components/FaqSection";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function ProgramsPage() {
  const programs = await prisma.siteProgram.findMany({
    where: { published: true },
    orderBy: { order: 'asc' }
  });

  return (
    <>
      <div className="container" style={{ padding: "80px 24px" }}>
        <h1 style={{ fontSize: "var(--text-4xl)", marginBottom: "24px" }}>Our Programs</h1>
        <p style={{ fontSize: "var(--text-lg)", color: "var(--text-muted)", marginBottom: "48px" }}>
          Explore our wide range of English courses designed for all ages and goals.
        </p>
        
        <div style={{ display: "grid", gap: "48px" }}>
          {programs.map((program) => (
            <section key={program.id} id={program.slug}>
              <h2 style={{ fontSize: "var(--text-2xl)", color: "var(--color-orange)", marginBottom: "16px" }}>{program.title}</h2>
              <p style={{ lineHeight: 1.6, marginBottom: "16px" }}>{program.description}</p>
              <Link href={`/programs/${program.slug}`} style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--color-navy)", fontWeight: 600, textDecoration: "none" }}>
                Read More <ArrowRight size={16} />
              </Link>
            </section>
          ))}
        </div>
      </div>
      
      <TestimonialsSection />
      <FaqSection />
    </>
  );
}
