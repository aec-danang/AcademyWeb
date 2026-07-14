import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const locale = useLocale();
  const getUrl = (path: string) => locale === 'vi' ? path : `/${locale}${path}`;

  return (
    <header className={styles.header}>
      <div className={`container ${styles.navContainer}`}>
        <Link href={getUrl("/")} className={styles.logo}>
          <Image src="/logos/aec/aec-logo-horizontal.png" alt="AEC Academy Logo" width={180} height={48} style={{ objectFit: 'contain', width: 'auto', height: '48px' }} />
        </Link>
        <nav>
          <ul className={styles.navLinks}>
            <li><Link href={getUrl("/programs")} className={styles.navLink}>Programs</Link></li>
            <li><Link href={getUrl("/about")} className={styles.navLink}>About</Link></li>
            <li><Link href={getUrl("/teachers")} className={styles.navLink}>Teachers</Link></li>
            <li><Link href={getUrl("/contact")} className={styles.navLink}>Contact</Link></li>
            <li>
              <Link href={getUrl("/login")} className="btn-primary" style={{ padding: "8px 16px", borderRadius: "8px" }}>
                Đăng nhập
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
