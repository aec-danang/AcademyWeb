import Link from "next/link";
import Image from "next/image";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.navContainer}`}>
        <Link href="/" className={styles.logo}>
          <Image src="/logos/aec/aec-logo-horizontal.png" alt="AEC Academy Logo" width={180} height={48} style={{ objectFit: 'contain' }} />
        </Link>
        <nav>
          <ul className={styles.navLinks}>
            <li><Link href="/programs" className={styles.navLink}>Programs</Link></li>
            <li><Link href="/programs#ielts" className={styles.navLink}>IELTS</Link></li>
            <li><Link href="/programs#kids" className={styles.navLink}>Kids & Teens</Link></li>
            <li><Link href="/programs#corporate" className={styles.navLink}>Corporate</Link></li>
            <li><Link href="/about" className={styles.navLink}>About</Link></li>
            <li><Link href="/#teachers" className={styles.navLink}>Teachers</Link></li>
            <li><Link href="/contact" className={styles.navLink}>Contact</Link></li>
            <li>
              <Link href="/contact#register" className="btn-primary">
                Register
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
