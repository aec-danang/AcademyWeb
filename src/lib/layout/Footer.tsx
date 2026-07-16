"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";
import { FaFacebook, FaYoutube, FaInstagram } from "react-icons/fa";
import styles from "./Footer.module.css";

type Sponsor = {
  name: string;
  imageUrl: string;
  website: string | null;
};

export default function Footer({ sponsors = [] }: { sponsors?: Sponsor[] }) {

  return (
      <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerTop}>
          <div>
            <Link href="/" className={styles.logo}>
              <Image src="/logos/aec/aec-logo-reverse-horizontal.png" alt="AEC Academy Logo" width={180} height={48} style={{ objectFit: 'contain', height: 'auto' }} />
            </Link>
            <p className={styles.aboutText}>
              Educating people through English so they become successful global citizens responsible toward themselves and the community.
            </p>
            <div className={styles.contactItem}>
              <span className={styles.icon}><MapPin size={18} /></span>
              <span>98 Le Dinh Ly St, Da Nang</span>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.icon}><Phone size={18} /></span>
              <span>(0236) 123 4567</span>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.icon}><Mail size={18} /></span>
              <span>info@academy.edu.vn</span>
            </div>
            <div style={{ marginTop: '16px', borderRadius: '8px', overflow: 'hidden' }}>
              <iframe 
                src="https://maps.google.com/maps?q=98%20Le%20Dinh%20Ly,%20Da%20Nang&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                width="100%" 
                height="150" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Academy English Center Map"
              ></iframe>
            </div>
          </div>
          
          <div>
            <h4 className={styles.title}>Quick Links</h4>
            <ul className={styles.links}>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/#teachers">Our Teachers</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/contact#register">Placement Test</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className={styles.title}>Programs</h4>
            <ul className={styles.links}>
              <li><Link href="/programs#kids">Kids & Teens</Link></li>
              <li><Link href="/programs#ielts">IELTS & Test Prep</Link></li>
              <li><Link href="/programs#adults">Adult Learners</Link></li>
              <li><Link href="/programs#corporate">Corporate English</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={styles.title}>Our Partners</h4>
            <div className={styles.partnersGridSmall}>
              {sponsors.map((sponsor) => (
                <div key={sponsor.name} className={styles.partnerLogoSmall} title={sponsor.name}>
                  {sponsor.website ? (
                    <a href={sponsor.website} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', height: '100%' }}>
                      <img 
                        suppressHydrationWarning
                        src={sponsor.imageUrl} 
                        alt={`${sponsor.name} logo`}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
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
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={(e) => {
                        e.currentTarget.src = `https://placehold.co/120x60/ffffff/ff7a00?text=${encodeURIComponent(sponsor.name)}`;
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <p>&copy; {new Date().getFullYear()} Academy English Center. All rights reserved.</p>
          <div className={styles.socials}>
            <a href="https://www.facebook.com/trungtam.anhngu.academy/" aria-label="Facebook" target="_blank" rel="noopener noreferrer"><FaFacebook size={18} /></a>
            <a href="https://www.youtube.com/@academyenglishcenter4309/" aria-label="YouTube" target="_blank" rel="noopener noreferrer"><FaYoutube size={18} /></a>
            <a href="https://www.instagram.com/academyaec.dn/" aria-label="Instagram" target="_blank" rel="noopener noreferrer"><FaInstagram size={18} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
