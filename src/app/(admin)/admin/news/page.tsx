"use client";

import styles from "../admin.module.css";
import { Plus, Edit2, Trash2 } from "lucide-react";

export default function AdminNews() {
  const mockNews = [
    { id: 1, title: "AEC Summer Camp 2026 Registration Open", date: "June 10, 2026", status: "Published", author: "Admin" },
    { id: 2, title: "Congratulations to our IELTS 8.0 Achievers", date: "June 05, 2026", status: "Published", author: "Sarah Jane" },
    { id: 3, title: "New Campus Opening in Hoa Xuan", date: "May 28, 2026", status: "Draft", author: "Admin" },
  ];

  return (
    <div>
      <div className={styles.flexBetween}>
        <h2>Manage News & Events</h2>
        <button className="btn-primary" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Plus size={18} />
          Create New Article
        </button>
      </div>

      <div className={styles.cardPanel}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Author</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockNews.map((item) => (
              <tr key={item.id}>
                <td style={{ fontWeight: 500 }}>{item.title}</td>
                <td>{item.date}</td>
                <td>{item.author}</td>
                <td>
                  <span className={`${styles.badge} ${item.status === 'Published' ? styles.badgeSuccess : styles.badgeWarning}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <div className={styles.actionButtons}>
                    <button className={styles.btnEdit} title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button className={styles.btnDelete} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
