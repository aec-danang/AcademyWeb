"use client";

import { useState } from "react";
import { createSponsor, updateSponsor, deleteSponsor, togglePublishSponsor } from "./actions";
import styles from "../admin.module.css";
import { Plus, Edit2, Trash2, Check, X, CheckCircle, XCircle } from "lucide-react";

type Sponsor = {
  id: string;
  name: string;
  imageUrl: string;
  website: string | null;
  order: number;
  published: boolean;
};

export default function SponsorsClient({ initialSponsors }: { initialSponsors: Sponsor[] }) {
  const [sponsors, setSponsors] = useState(initialSponsors);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", imageUrl: "", website: "", order: 0, published: true });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    await createSponsor({ ...formData, website: formData.website || null });
    // Reset form and UI would update via revalidatePath, but we can optimistically reload or wait for refresh
    window.location.reload();
  };

  const handleUpdate = async () => {
    if (isEditing) {
      await updateSponsor(isEditing, { ...formData, website: formData.website || null });
      window.location.reload();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this sponsor?")) {
      await deleteSponsor(id);
      window.location.reload();
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    await togglePublishSponsor(id, !currentStatus);
    window.location.reload();
  };

  const startEdit = (sponsor: Sponsor) => {
    setIsEditing(sponsor.id);
    setIsCreating(false);
    setFormData({
      name: sponsor.name,
      imageUrl: sponsor.imageUrl,
      website: sponsor.website || "",
      order: sponsor.order,
      published: sponsor.published,
    });
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setIsCreating(false);
  };

  return (
    <div>
      <div className={styles.flexBetween}>
        <h2>Manage Sponsors</h2>
        {!isCreating && !isEditing && (
          <button 
            className="btn-primary" 
            style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
            onClick={() => {
              setIsCreating(true);
              setFormData({ name: "", imageUrl: "", website: "", order: 0, published: true });
            }}
          >
            <Plus size={18} />
            Add Sponsor
          </button>
        )}
      </div>

      {(isCreating || isEditing) && (
        <div className={styles.cardPanel} style={{ marginBottom: "2rem" }}>
          <h3>{isCreating ? "Add New Sponsor" : "Edit Sponsor"}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
              <input 
                type="text" 
                placeholder="Name" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
              <input 
                type="text" 
                placeholder="Image URL" 
                value={formData.imageUrl} 
                onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
              />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
              <input 
                type="text" 
                placeholder="Website URL (optional)" 
                value={formData.website} 
                onChange={e => setFormData({...formData, website: e.target.value})} 
              />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
              <input 
                type="number" 
                placeholder="Order" 
                value={formData.order} 
                onChange={e => setFormData({...formData, order: parseInt(e.target.value) || 0})} 
              />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input 
                type="checkbox" 
                checked={formData.published} 
                onChange={e => setFormData({...formData, published: e.target.checked})} 
              />
              Published
            </label>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button className="btn-primary" onClick={isCreating ? handleCreate : handleUpdate}>Save</button>
              <button className="btn-secondary" onClick={cancelEdit}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.cardPanel}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Logo</th>
              <th>Name</th>
              <th>Order</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sponsors.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "1rem" }}>No sponsors found</td>
              </tr>
            )}
            {sponsors.map((item) => (
              <tr key={item.id}>
                <td>
                  <img src={item.imageUrl} alt={item.name} style={{ width: "80px", height: "40px", objectFit: "contain" }} />
                </td>
                <td style={{ fontWeight: 500 }}>
                  {item.name}
                  {item.website && <div style={{ fontSize: "0.8rem", color: "var(--color-navy-light)" }}>{item.website}</div>}
                </td>
                <td>{item.order}</td>
                <td>
                  <button 
                    onClick={() => handleTogglePublish(item.id, item.published)}
                    style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    {item.published ? (
                      <span className={`${styles.badge} ${styles.badgeSuccess}`}><CheckCircle size={14} style={{ marginRight: 4 }}/> Published</span>
                    ) : (
                      <span className={`${styles.badge} ${styles.badgeWarning}`}><XCircle size={14} style={{ marginRight: 4 }}/> Hidden</span>
                    )}
                  </button>
                </td>
                <td>
                  <div className={styles.actionButtons}>
                    <button className={styles.btnEdit} title="Edit" onClick={() => startEdit(item)}>
                      <Edit2 size={16} />
                    </button>
                    <button className={styles.btnDelete} title="Delete" onClick={() => handleDelete(item.id)}>
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
