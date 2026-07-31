import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ProgramDetailsClient from "@/components/ProgramDetailsClient";
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
      <section className="relative overflow-hidden bg-navy text-white pt-32 pb-24">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-0 -left-1/4 w-1/2 h-full bg-orange blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-blue-500 blur-[100px] rounded-full mix-blend-screen" />
        </div>
        <div className="container relative z-10 mx-auto px-4">
          <Link href="/programs" className="inline-flex items-center gap-2 text-orange font-semibold hover:text-white transition-colors mb-8">
            <ArrowLeft size={16} /> Trở về danh sách chương trình
          </Link>
          <div className="max-w-4xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-orange font-semibold uppercase tracking-wider mb-4 border border-white/20">
              {program.description}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              {program.title}
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed max-w-2xl mb-12">
              Chương trình được thiết kế chuẩn quốc tế dành riêng cho độ tuổi này, giúp học viên rèn luyện và bứt phá khả năng tiếng Anh.
            </p>
          </div>
        </div>
        {/* Decorative wave at the bottom */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
          <svg className="relative block w-full h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.06,155.24,124.59,240,105.7,269.45,99.19,295.6,90,321.39,56.44Z" className="fill-slate-50 dark:fill-slate-950"></path>
          </svg>
        </div>
      </section>

      <div className="bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4 py-12 md:py-20">
        <ProgramDetailsClient contentJson={program.content || "{}"} />
        </div>
      </div>

      <TestimonialsSection />
      <FaqSection />
    </>
  );
}
