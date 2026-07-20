"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";
import { FaFacebook, FaYoutube, FaInstagram } from "react-icons/fa";

type Sponsor = {
  name: string;
  imageUrl: string;
  website: string | null;
};

export default function Footer({ sponsors = [] }: { sponsors?: Sponsor[] }) {

  return (
    <footer className="bg-navy text-white pt-16 pb-6 mt-auto">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Column 1: About & Contact */}
          <div>
            <Link href="/" className="inline-block mb-6">
              <Image 
                src="/logos/aec/aec-logo-reverse-vertical.png" 
                alt="AEC Academy Logo" 
                width={140} 
                height={140} 
                className="object-contain h-auto" 
              />
            </Link>
            <p className="text-navy-light/80 leading-relaxed mb-6 max-w-sm text-sm">
              Educating people through English so they become successful global citizens responsible toward themselves and the community.
            </p>
            <div className="flex flex-col gap-3 text-sm text-navy-light/90">
              <div className="flex items-start gap-3">
                <MapPin className="text-orange shrink-0 mt-0.5" size={18} />
                <span>98 Le Dinh Ly St, Da Nang</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-orange shrink-0" size={18} />
                <span>(0236) 123 4567</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-orange shrink-0" size={18} />
                <span>info@academy.edu.vn</span>
              </div>
            </div>
            
            <div className="mt-6 rounded-lg overflow-hidden border border-navy-dark shadow-inner">
              <iframe 
                src="https://maps.google.com/maps?q=98%20Le%20Dinh%20Ly,%20Da%20Nang&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                width="100%" 
                height="150" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Academy English Center Map"
                className="w-full grayscale opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
              ></iframe>
            </div>
          </div>
          
          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-white text-lg font-bold mb-6 font-montserrat tracking-wide">Quick Links</h4>
            <ul className="flex flex-col gap-3">
              <li><Link href="/news" className="text-navy-light/70 hover:text-orange transition-colors text-sm">News & Events</Link></li>
              <li><Link href="/posts" className="text-navy-light/70 hover:text-orange transition-colors text-sm">Our Blog</Link></li>
              <li><Link href="/#teachers" className="text-navy-light/70 hover:text-orange transition-colors text-sm">Our Teachers</Link></li>
              <li><Link href="/contact" className="text-navy-light/70 hover:text-orange transition-colors text-sm">Contact Us</Link></li>
              <li><Link href="/contact#register" className="text-navy-light/70 hover:text-orange transition-colors text-sm">Placement Test</Link></li>
            </ul>
          </div>
          
          {/* Column 3: Programs */}
          <div>
            <h4 className="text-white text-lg font-bold mb-6 font-montserrat tracking-wide">Programs</h4>
            <ul className="flex flex-col gap-3">
              <li><Link href="/programs#kids" className="text-navy-light/70 hover:text-orange transition-colors text-sm">Kids & Teens</Link></li>
              <li><Link href="/programs#ielts" className="text-navy-light/70 hover:text-orange transition-colors text-sm">IELTS & Test Prep</Link></li>
              <li><Link href="/programs#adults" className="text-navy-light/70 hover:text-orange transition-colors text-sm">Adult Learners</Link></li>
              <li><Link href="/programs#corporate" className="text-navy-light/70 hover:text-orange transition-colors text-sm">Corporate English</Link></li>
            </ul>
          </div>

          {/* Column 4: Partners */}
          <div>
            <h4 className="text-white text-lg font-bold mb-6 font-montserrat tracking-wide">Our Partners</h4>
            {sponsors.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {sponsors.map((sponsor) => (
                  <div key={sponsor.name} className="bg-white/95 p-2 rounded-md flex items-center justify-center aspect-video hover:scale-105 hover:bg-white transition-all shadow-sm" title={sponsor.name}>
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
              <p className="text-sm text-navy-light/50 italic">Partners will be updated soon.</p>
            )}
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="pt-6 border-t border-navy-dark flex flex-col md:flex-row justify-between items-center gap-4 text-navy-light/60 text-sm">
          <p>&copy; {new Date().getFullYear()} Academy English Center. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="https://www.facebook.com/trungtam.anhngu.academy/" aria-label="Facebook" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-navy-dark flex items-center justify-center text-white hover:bg-orange hover:shadow-lg transition-all">
              <FaFacebook size={18} />
            </a>
            <a href="https://www.youtube.com/@academyenglishcenter4309/" aria-label="YouTube" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-navy-dark flex items-center justify-center text-white hover:bg-orange hover:shadow-lg transition-all">
              <FaYoutube size={18} />
            </a>
            <a href="https://www.instagram.com/academyaec.dn/" aria-label="Instagram" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-navy-dark flex items-center justify-center text-white hover:bg-orange hover:shadow-lg transition-all">
              <FaInstagram size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
