import styles from "./PublicHalloween.module.css";

export function PublicHalloweenAccents() {
  return <div className={styles.accents} aria-hidden="true">
    <div className={styles.mist}><span /><span /></div>
    {[0, 1].map(i => <svg key={i} className={styles.web} viewBox="0 0 100 100"><path d="M0 0h100M0 0v100M0 0l100 100M0 0l100 40M0 0l40 100M0 30q18 2 12 0M0 28Q25 25 28 0M0 55Q49 49 55 0M0 83Q74 74 83 0M28 70Q62 61 70 28" /></svg>)}
    <svg className={styles.spider} viewBox="0 0 30 160"><path d="M15 0v126" /><g><ellipse cx="15" cy="136" rx="5" ry="7" /><path d="m12 132-7-6m7 10-9-3m9 7-7 6m13-14 7-6m-7 10 9-3m-9 7 7 6" /><circle cx="13" cy="134" r="1" /><circle cx="17" cy="134" r="1" /></g></svg>
  </div>;
}
