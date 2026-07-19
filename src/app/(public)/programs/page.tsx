import TestimonialsSection from "@/components/TestimonialsSection";
import FaqSection from "@/components/FaqSection";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Target } from "lucide-react";
import Image from "next/image";

export default async function ProgramsPage() {
  const programs = await prisma.siteProgram.findMany({
    where: { published: true },
    orderBy: { order: 'asc' }
  });

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-navy text-white pt-24 pb-32">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-0 -left-1/4 w-1/2 h-full bg-orange blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-blue-500 blur-[100px] rounded-full mix-blend-screen" />
        </div>
        
        <div className="container relative z-10 max-w-4xl mx-auto text-center px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6">
            <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
            <span className="text-sm font-medium tracking-wide">AEC Bright Learning System</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Our <span className="text-orange">Programs</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Explore our wide range of English courses designed for all ages and goals. Unlock your full potential with our proven methodology.
          </p>
        </div>
        
        {/* Decorative wave at the bottom */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
          <svg className="relative block w-full h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.06,155.24,124.59,240,105.7,269.45,99.19,295.6,90,321.39,56.44Z" className="fill-white dark:fill-slate-950"></path>
          </svg>
        </div>
      </section>
      
      {/* Programs Grid */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 relative -mt-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((program, idx) => (
              <div 
                key={program.id} 
                id={program.slug}
                className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-2 border border-slate-200/60 dark:border-slate-800 transition-all duration-300 overflow-hidden"
              >
                <div className="h-48 bg-slate-100 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
                  {/* Abstract placeholder background pattern */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-navy via-transparent to-transparent group-hover:scale-110 transition-transform duration-700" />
                  
                  {/* Dynamic Icon based on program type/idx */}
                  <div className="relative z-10 w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 shadow-md flex items-center justify-center text-orange group-hover:scale-110 group-hover:bg-orange group-hover:text-white transition-all duration-300">
                    {idx % 3 === 0 ? <BookOpen size={32} /> : idx % 3 === 1 ? <Target size={32} /> : <Clock size={32} />}
                  </div>
                </div>
                
                <div className="p-8 flex flex-col flex-grow">
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-orange/10 text-orange text-xs font-bold uppercase tracking-wider mb-3">
                      All Levels
                    </span>
                    <h2 className="text-2xl font-bold text-navy dark:text-slate-100 group-hover:text-orange transition-colors">
                      {program.title}
                    </h2>
                  </div>
                  
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8 flex-grow">
                    {program.description}
                  </p>
                  
                  <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
                    <Link 
                      href={`/programs/${program.slug}`} 
                      className="inline-flex items-center justify-between w-full font-bold text-navy dark:text-slate-200 group-hover:text-orange transition-colors"
                    >
                      <span>Explore Program</span>
                      <span className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-orange group-hover:text-white transition-colors">
                        <ArrowRight size={18} />
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <TestimonialsSection />
      <FaqSection />
    </>
  );
}
