import styles from "../admin.module.css";

export default function NotificationsPage() {
  return (
    <div>
      <div className={styles.flexBetween}>
        <h2>Notifications</h2>
      </div>
      <div className={styles.cardPanel}>
        <p style={{ color: "var(--text-muted)" }}>You have no new notifications.</p>
      </div>
    </div>
  );
}
