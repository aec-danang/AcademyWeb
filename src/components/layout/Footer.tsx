import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerTop}>
          <div>
            <Link href="/" className={styles.logo}>
              AEC<span>Academy</span>
            </Link>
            <p className={styles.aboutText}>
              Educating people through English so they become successful global citizens responsible toward themselves and the community.
            </p>
            <div className={styles.contactItem}>
              <span className={styles.icon}>📍</span>
              <span>98 Le Dinh Ly St, Da Nang</span>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.icon}>📞</span>
              <span>(0236) 123 4567</span>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.icon}>✉️</span>
              <span>info@academy.edu.vn</span>
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
            <h4 className={styles.title}>Newsletter</h4>
            <p className={styles.aboutText} style={{ marginBottom: "16px" }}>
              Subscribe to get the latest news and offers.
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <input 
                type="email" 
                placeholder="Your email" 
                style={{
                  padding: "10px 16px",
                  borderRadius: "999px",
                  border: "none",
                  width: "100%",
                  outline: "none"
                }}
              />
              <button className="btn-primary" style={{ padding: "10px 20px" }}>
                Send
              </button>
            </div>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <p>&copy; {new Date().getFullYear()} Academy English Center. All rights reserved.</p>
          <div className={styles.socials}>
            <a href="#" aria-label="Facebook">FB</a>
            <a href="#" aria-label="YouTube">YT</a>
            <a href="#" aria-label="Instagram">IG</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
