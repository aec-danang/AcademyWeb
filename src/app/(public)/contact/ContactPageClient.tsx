"use client";

import { useEffect, useRef } from "react";
import ContactFormClient from "./ContactFormClient";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function ContactPageClient({ programs }: { programs: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Hero Animation
    gsap.fromTo(".hero-content > *",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power3.out" }
    );

    // Content Wrapper Animation
    gsap.fromTo(".info-column > *",
      { x: -30, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, stagger: 0.15, delay: 0.3, ease: "power3.out" }
    );

    gsap.fromTo(".form-card",
      { x: 30, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, delay: 0.5, ease: "power3.out" }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef}>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-navy text-white pt-32 pb-32">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-0 -left-1/4 w-1/2 h-full bg-orange blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-blue-500 blur-[100px] rounded-full mix-blend-screen" />
        </div>
        
        <div className="hero-content container relative z-10 max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Kết nối với <span className="text-orange">Chúng tôi</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Bạn có thắc mắc về các chương trình học hoặc muốn đăng ký thi xếp lớp? Chúng tôi luôn sẵn sàng hỗ trợ!
          </p>
        </div>
        
        {/* Decorative wave at the bottom */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
          <svg className="relative block w-full h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.06,155.24,124.59,240,105.7,269.45,99.19,295.6,90,321.39,56.44Z" className="fill-white dark:fill-slate-950"></path>
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 relative -mt-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Information Column */}
            <div className="info-column space-y-8">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200/60 dark:border-slate-800">
                <h2 className="text-3xl font-bold text-navy dark:text-white mb-8">Thông tin liên hệ</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange/10 flex items-center justify-center text-orange shrink-0">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-navy dark:text-slate-200">Địa chỉ</h4>
                      <p className="text-slate-600 dark:text-slate-400 mt-1">98 Lê Đình Lý, Đà Nẵng</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                      <Phone size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-navy dark:text-slate-200">Điện thoại</h4>
                      <p className="text-slate-600 dark:text-slate-400 mt-1">(0236) 123 4567</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                      <Mail size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-navy dark:text-slate-200">Email</h4>
                      <p className="text-slate-600 dark:text-slate-400 mt-1">info@academy.edu.vn</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                      <Clock size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-navy dark:text-slate-200">Giờ làm việc</h4>
                      <p className="text-slate-600 dark:text-slate-400 mt-1">Thứ 2 - CN: 8:00 - 21:00</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Registration Form Column */}
            <div id="register" className="form-card">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200/60 dark:border-slate-800">
                <h2 className="text-2xl font-bold text-navy dark:text-white mb-2">Đăng ký thi xếp lớp</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-8">Vui lòng điền vào biểu mẫu dưới đây và các tư vấn viên của chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.</p>
                <ContactFormClient programs={programs} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
