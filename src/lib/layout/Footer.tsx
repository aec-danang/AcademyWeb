"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, ChevronRight, ArrowRight } from "lucide-react";
import { FaFacebook, FaYoutube, FaInstagram } from "react-icons/fa";

type Sponsor = {
  name: string;
  imageUrl: string;
  website: string | null;
};

type SiteProgram = {
  id: string;
  title: string;
  slug: string;
};

export default function Footer({ sponsors = [], programs = [] }: { sponsors?: Sponsor[], programs?: SiteProgram[] }) {

  return (
    <footer className="relative bg-[#0e0f22] text-white mt-auto overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[300px] -right-[300px] w-[600px] h-[600px] rounded-full bg-orange/10 blur-[120px]"></div>
        <div className="absolute bottom-[100px] -left-[200px] w-[500px] h-[500px] rounded-full bg-navy-light/5 blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pt-16 pb-16">
          
          {/* Column 1: Brand & Contact */}
          <div className="lg:col-span-4 flex flex-col">
            <Link href="/" className="inline-block mb-8">
              <Image 
                src="/logos/aec/aec-logo-reverse-vertical.png" 
                alt="AEC Academy Logo" 
                width={160} 
                height={160} 
                className="object-contain h-auto" 
              />
            </Link>
            <p className="text-white/70 leading-relaxed mb-8 max-w-sm text-base">
              Educating people through English so they become successful global citizens responsible toward themselves and the community.
            </p>
            
            <div className="flex flex-col gap-5 text-sm text-white/90 mb-8">
              <div className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-orange group-hover:border-orange transition-colors duration-300">
                  <MapPin size={18} />
                </div>
                <span className="mt-2.5">98 Le Dinh Ly St, Da Nang</span>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-orange group-hover:border-orange transition-colors duration-300">
                  <Phone size={18} />
                </div>
                <span>(0236) 123 4567</span>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-orange group-hover:border-orange transition-colors duration-300">
                  <Mail size={18} />
                </div>
                <span>info@academy.edu.vn</span>
              </div>
            </div>

            <div className="mt-auto pt-4 flex flex-col gap-6">
              <div className="flex gap-4">
                <a href="https://www.facebook.com/trungtam.anhngu.academy/" aria-label="Facebook" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-orange hover:border-orange hover:shadow-[0_4px_20px_rgba(246,141,46,0.4)] hover:-translate-y-1 transition-all duration-300">
                  <FaFacebook size={16} />
                </a>
                <a href="https://www.youtube.com/@academyenglishcenter4309/" aria-label="YouTube" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-orange hover:border-orange hover:shadow-[0_4px_20px_rgba(246,141,46,0.4)] hover:-translate-y-1 transition-all duration-300">
                  <FaYoutube size={16} />
                </a>
                <a href="https://www.instagram.com/academyaec.dn/" aria-label="Instagram" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-orange hover:border-orange hover:shadow-[0_4px_20px_rgba(246,141,46,0.4)] hover:-translate-y-1 transition-all duration-300">
                  <FaInstagram size={16} />
                </a>
              </div>
              <p className="text-white/40 text-sm">&copy; {new Date().getFullYear()} Academy English Center. All rights reserved.</p>
            </div>
          </div>
          
          {/* Column 2: Programs */}
          <div className="lg:col-span-4 lg:mt-6">
            <h4 className="text-white text-xl font-bold mb-8 font-montserrat tracking-wide flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-orange"></span> Programs
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              {programs.length > 0 ? (
                programs.map((program) => (
                  <li key={program.id}>
                    <Link href={`/programs/${program.slug}`} className="group flex items-center text-white/70 hover:text-white transition-all duration-300 text-base">
                      <ChevronRight size={16} className="text-orange opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 mr-2" />
                      <span className="group-hover:translate-x-1 transition-transform duration-300">{program.title}</span>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-sm text-white/50 italic">Programs will be updated soon.</li>
              )}
            </ul>
          </div>

          {/* Column 4: Partners & Map */}
          <div className="lg:col-span-4 flex flex-col gap-10 lg:mt-6">
            <div>
              <h4 className="text-white text-xl font-bold mb-8 font-montserrat tracking-wide flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-orange"></span> Our Partners
              </h4>
              {sponsors.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {sponsors.map((sponsor) => (
                    <div key={sponsor.name} className="bg-white p-3 rounded-xl flex items-center justify-center aspect-video hover:scale-105 hover:shadow-[0_8px_25px_rgba(246,141,46,0.3)] transition-all duration-300 cursor-pointer" title={sponsor.name}>
                      {sponsor.website ? (
                        <a href={sponsor.website} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative">
                          <img 
                            suppressHydrationWarning
                            src={sponsor.imageUrl} 
                            alt={`${sponsor.name} logo`}
                            className="w-full h-full object-contain mix-blend-multiply"
                            onError={(e) => {
                              e.currentTarget.src = `https://placehold.co/120x60/ffffff/ff7a00?text=${encodeURIComponent(sponsor.name)}`;
                            }}
                          />
                        </a>
                      ) : (
                        <img 
                          suppressHydrationWarning
                          src={sponsor.imageUrl} 
                          alt={`${sponsor.name} logo`}
                          className="w-full h-full object-contain mix-blend-multiply"
                          onError={(e) => {
                            e.currentTarget.src = `https://placehold.co/120x60/ffffff/ff7a00?text=${encodeURIComponent(sponsor.name)}`;
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/50 italic">Partners will be updated soon.</p>
              )}
            </div>

            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)] relative group flex-grow">
              <div className="absolute inset-0 bg-navy/40 backdrop-blur-[2px] group-hover:bg-transparent group-hover:backdrop-blur-none transition-all duration-500 pointer-events-none z-10"></div>
              <iframe 
                src="https://maps.google.com/maps?q=98%20Le%20Dinh%20Ly,%20Da%20Nang&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                width="100%" 
                height="100%" 
                style={{ border: 0, minHeight: '220px' }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Academy English Center Map"
                className="w-full h-full opacity-70 group-hover:opacity-100 transition-all duration-700"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
