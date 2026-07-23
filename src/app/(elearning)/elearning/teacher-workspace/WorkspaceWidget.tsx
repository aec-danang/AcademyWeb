import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, ArrowRight } from "lucide-react";
import styles from "../elearning.module.css";

export function WorkspaceWidget({
  eyebrow,
  title,
  icon: Icon,
  href,
  linkLabel = "View all",
  className = "",
  children,
}: {
  eyebrow: string;
  title: string;
  icon: LucideIcon;
  href?: string;
  linkLabel?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`${styles.dashboardPanel} ${className}`}>
      <div className={styles.dashboardPanelHeader}>
        <div>
          <span className={styles.cockpitEyebrow}><Icon size={16} /> {eyebrow}</span>
          <h2>{title}</h2>
        </div>
        {href ? <Link href={href}>{linkLabel} <ArrowRight size={14} /></Link> : null}
      </div>
      {children}
    </section>
  );
}

export function WidgetError({ message = "This summary is temporarily unavailable." }: { message?: string }) {
  return (
    <div className={styles.widgetState} role="status">
      <AlertCircle size={24} />
      <strong>Couldn&apos;t load this widget</strong>
      <p>{message} You can still open the module directly.</p>
    </div>
  );
}

export function WidgetEmpty({
  icon: Icon,
  title,
  message,
  href,
  action,
}: {
  icon: LucideIcon;
  title: string;
  message: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className={styles.widgetState}>
      <Icon size={26} />
      <strong>{title}</strong>
      <p>{message}</p>
      {href && action ? <Link href={href}>{action} <ArrowRight size={14} /></Link> : null}
    </div>
  );
}

export function WidgetSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className={styles.widgetSkeleton} aria-label="Loading widget" aria-busy="true">
      <div className={styles.skeletonHeading} />
      {Array.from({ length: rows }, (_, index) => <div className={styles.skeletonRow} key={index} />)}
    </div>
  );
}
