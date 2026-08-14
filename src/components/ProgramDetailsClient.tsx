"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Calendar, Target, Wallet, Users, CheckCircle2 } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface OverviewItem {
  label: string;
  value: string;
  icon: string;
}

interface TimelineItem {
  title: string;
  subtitle: string;
  duration: string;
  desc?: string;
}

interface ProgramData {
  overview: OverviewItem[];
  timeline: TimelineItem[];
  note?: string;
}

const IconMap: Record<string, React.ReactNode> = {
  Calendar: <Calendar size={24} className="text-orange" />,
  Target: <Target size={24} className="text-orange" />,
  Wallet: <Wallet size={24} className="text-orange" />,
  Users: <Users size={24} className="text-orange" />
};

export default function ProgramDetailsClient({ contentJson }: { contentJson: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  let data: ProgramData | null = null;
  let parseError = false;
  try {
    data = JSON.parse(contentJson);
  } catch (e) {
    parseError = true;
  }

  useGSAP(() => {
    // Animate overview cards
    gsap.from(".overview-card", {
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".overview-container",
        start: "top 85%",
      }
    });

    // Animate timeline line drawing
    gsap.from(".timeline-line", {
      scaleY: 0,
      transformOrigin: "top",
      ease: "none",
      scrollTrigger: {
        trigger: timelineRef.current,
        start: "top 70%",
        end: "bottom 50%",
        scrub: 1
      }
    });

    // Animate each timeline card as it enters
    const timelineItems = gsap.utils.toArray(".timeline-item");
    timelineItems.forEach((item: any, i) => {
      gsap.from(item, {
        x: i % 2 === 0 ? 50 : -50,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: item,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });
    });
  }, { scope: containerRef });

  if (parseError) return <div dangerouslySetInnerHTML={{ __html: contentJson }} className="prose max-w-none" />;
  if (!data || !data.overview) return null;

  return (
    <div ref={containerRef} className="pb-20">
      {/* Overview Cards */}
      <div className="overview-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20 relative z-20 px-4 md:px-0 items-stretch auto-rows-fr">
        {data.overview.map((item, idx) => (
          <div key={idx} className="overview-card bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-100 dark:border-slate-800 hover:-translate-y-2 transition-transform duration-300 flex flex-col h-full">
            <div className="w-12 h-12 rounded-full bg-orange/10 flex items-center justify-center mb-4 shrink-0">
              {IconMap[item.icon] || <CheckCircle2 size={24} className="text-orange" />}
            </div>
            <h3 className="text-sm font-bold text-navy dark:text-slate-300 mb-2 tracking-wider shrink-0">{item.label}</h3>
            <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed flex-grow">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Roadmap Timeline */}
      <div className="max-w-4xl mx-auto px-4 md:px-0">
        <h2 className="text-3xl md:text-4xl font-bold text-navy dark:text-white text-center mb-16">
          Lộ Trình <span className="text-orange">Đào Tạo</span>
        </h2>
        
        <div ref={timelineRef} className="relative pl-8 md:pl-0">
          {/* Vertical Line */}
          <div className="timeline-line absolute left-[26px] md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-orange/20 via-orange to-blue-500 rounded-full md:-translate-x-1/2" />
          
          <div className="space-y-12">
            {data.timeline.map((step, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div key={idx} className="timeline-item relative flex items-center md:justify-between w-full">
                  {/* Left Side (Empty on mobile, alternating on desktop) */}
                  <div className={`hidden md:block w-[45%] ${!isEven ? 'order-1 text-right' : 'order-1 invisible'}`}>
                    {!isEven && (
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-shadow">
                        <div className="text-orange font-black text-3xl mb-1">{step.title}</div>
                        <div className="text-slate-500 text-sm mb-3 font-semibold uppercase tracking-widest">{step.subtitle}</div>
                        <div className="text-navy dark:text-white font-semibold text-lg">{step.duration}</div>
                        {step.desc && <div className="text-slate-600 dark:text-slate-400 mt-3 text-sm border-t border-slate-100 dark:border-slate-800 pt-3">{step.desc}</div>}
                      </div>
                    )}
                  </div>
                  
                  {/* Center Dot */}
                  <div className="absolute left-0 md:left-1/2 w-14 h-14 bg-white dark:bg-slate-950 border-4 border-orange rounded-full flex items-center justify-center z-10 md:-translate-x-1/2 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                    <span className="text-navy dark:text-white font-bold">{idx + 1}</span>
                  </div>
                  
                  {/* Right Side */}
                  <div className={`w-full pl-20 md:pl-0 md:w-[45%] ${isEven ? 'order-2' : 'order-2 md:hidden'}`}>
                    {(isEven || true /* Always show on mobile right side */) && (
                      <div className={`bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-shadow ${!isEven ? 'md:hidden' : ''}`}>
                        <div className="text-orange font-black text-3xl mb-1">{step.title}</div>
                        <div className="text-slate-500 text-sm mb-3 font-semibold uppercase tracking-widest">{step.subtitle}</div>
                        <div className="text-navy dark:text-white font-semibold text-lg">{step.duration}</div>
                        {step.desc && <div className="text-slate-600 dark:text-slate-400 mt-3 text-sm border-t border-slate-100 dark:border-slate-800 pt-3">{step.desc}</div>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {data.note && (
          <div className="mt-20 p-6 bg-orange/5 dark:bg-orange/10 rounded-2xl border border-orange/20 text-center text-slate-700 dark:text-slate-300 italic shadow-sm">
            <CheckCircle2 className="inline-block text-orange mr-2 mb-1" size={20} />
            {data.note}
          </div>
        )}
      </div>
    </div>
  );
}
