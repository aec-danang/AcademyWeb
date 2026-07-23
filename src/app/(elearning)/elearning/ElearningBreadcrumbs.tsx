import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import styles from "./elearning.module.css";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function ElearningBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
      <Link href="/elearning" aria-label="E-learning home"><Home size={15} /></Link>
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`}>
          <ChevronRight size={14} />
          {item.href ? <Link href={item.href}>{item.label}</Link> : <strong aria-current="page">{item.label}</strong>}
        </span>
      ))}
    </nav>
  );
}
