"use client";

import { useState } from "react";
import { createSponsor, updateSponsor, deleteSponsor, reorderSponsors } from "./actions";
import styles from "../admin.module.css";
import { Plus, Edit2, Trash2, GripVertical, Search, X } from "lucide-react";

type Sponsor = {
  id: string;
  name: string;
  imageUrl: string;
  website: string | null;
  order: number;
  published: boolean;
};

export default function SponsorsClient({ initialSponsors }: { initialSponsors: Sponsor[] }) {
  // Sort sponsors by order initially
  const [sponsors, setSponsors] = useState([...initialSponsors].sort((a, b) => a.order - b.order));
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", imageUrl: "", website: "" });
  const [isCreating, setIsCreating] = useState(false);

  // Drag and Drop States
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const filteredSponsors = sponsors.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
    const newOrder = sponsors.length > 0 ? Math.max(...sponsors.map(s => s.order)) + 1 : 1;
    await createSponsor({ ...formData, website: formData.website || null, order: newOrder, published: true });
    window.location.reload();
  };

  const handleUpdate = async () => {
    if (isEditing) {
      const sponsorToEdit = sponsors.find(s => s.id === isEditing);
      if (sponsorToEdit) {
        await updateSponsor(isEditing, { ...formData, website: formData.website || null, order: sponsorToEdit.order, published: sponsorToEdit.published });
        window.location.reload();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this sponsor?")) {
      await deleteSponsor(id);
      window.location.reload();
    }
  };

  const startEdit = (sponsor: Sponsor) => {
    setIsEditing(sponsor.id);
    setIsCreating(false);
    setFormData({
      name: sponsor.name,
      imageUrl: sponsor.imageUrl,
      website: sponsor.website || "",
    });
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setIsCreating(false);
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnter = (index: number) => {
    setDragOverIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      // Create new sorted array
      const newSponsors = [...sponsors];
      const draggedItem = newSponsors[draggedIndex];
      newSponsors.splice(draggedIndex, 1);
      newSponsors.splice(dragOverIndex, 0, draggedItem);
      
      // Update local state immediately
      setSponsors(newSponsors);
      
      // Compute updates for the backend
      const updates = newSponsors.map((s, idx) => ({ id: s.id, order: idx + 1 }));
      await reorderSponsors(updates);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div>
      <div className={styles.flexBetween} style={{ alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0 }}>Manage Sponsors</h2>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <div className={styles.formGroup} style={{ marginBottom: 0, position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input 
              type="text" 
              placeholder="Search sponsors..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: "2.75rem", width: "250px" }}
            />
          </div>
          <button 
            className="btn-primary" 
            style={{ display: "flex", gap: "0.5rem", alignItems: "center", whiteSpace: "nowrap" }}
            onClick={() => {
              setIsCreating(true);
              setFormData({ name: "", imageUrl: "", website: "" });
            }}
          >
            <Plus size={18} />
            Add Sponsor
          </button>
        </div>
      </div>

      {(isCreating || isEditing) && (
        <div className={styles.modalOverlay} onClick={cancelEdit}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{isCreating ? "Add New Sponsor" : "Edit Sponsor"}</h3>
              <button className={styles.btnClose} onClick={cancelEdit}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
                <div style={{ width: "120px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-navy)" }}>Logo Preview</label>
                  <div style={{ width: "100%", height: "80px", borderRadius: "12px", border: "1px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", overflow: "hidden" }}>
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "contain", padding: "0.5rem" }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div style={{ color: "#94a3b8", fontSize: "0.75rem", textAlign: "center", padding: "0.5rem" }}>No Image</div>
                    )}
                  </div>
                </div>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                    <label>Sponsor Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. FPT Software" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                    />
                  </div>
                  <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                    <label>Logo URL</label>
                    <input 
                      type="text" 
                      placeholder="https://example.com/logo.png" 
                      value={formData.imageUrl} 
                      onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                    />
                  </div>
                </div>
              </div>
              
              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label>Website URL <span style={{ color: "#94a3b8", fontWeight: "normal" }}>(Optional)</span></label>
                <input 
                  type="text" 
                  placeholder="https://example.com" 
                  value={formData.website} 
                  onChange={e => setFormData({...formData, website: e.target.value})} 
                />
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", justifyContent: "flex-end", borderTop: "1px solid #f1f5f9", paddingTop: "1.5rem" }}>
                <button className="btn-secondary" onClick={cancelEdit}>Cancel</button>
                <button className="btn-primary" onClick={isCreating ? handleCreate : handleUpdate}>{isCreating ? "Add Sponsor" : "Save Changes"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className={styles.listContainer}>

          {/* List Items */}
          {filteredSponsors.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
              No sponsors found matching your search.
            </div>
          ) : (
            filteredSponsors.map((item, index) => {
              // We need the true index in the main `sponsors` array for DND to work correctly
              // when filtered, but DND shouldn't usually happen while searching.
              // To be safe, disable DND when searching.
              const isSearching = searchQuery.length > 0;
              const globalIndex = sponsors.findIndex(s => s.id === item.id);
              
              return (
                <div 
                  key={item.id} 
                  className={styles.listItem}
                  draggable={!isSearching}
                  onDragStart={() => !isSearching && handleDragStart(globalIndex)}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    if (!isSearching) handleDragEnter(globalIndex);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnd={handleDragEnd}
                  style={{
                    opacity: draggedIndex === globalIndex ? 0.5 : 1,
                    transform: dragOverIndex === globalIndex && draggedIndex !== globalIndex 
                      ? (draggedIndex! < dragOverIndex ? "translateY(-4px)" : "translateY(4px)") 
                      : "none",
                    borderTop: dragOverIndex === globalIndex && draggedIndex !== globalIndex && draggedIndex! > dragOverIndex ? "2px solid var(--color-orange)" : undefined,
                    borderBottom: dragOverIndex === globalIndex && draggedIndex !== globalIndex && draggedIndex! < dragOverIndex ? "2px solid var(--color-orange)" : undefined,
                  }}
                >
                  <div className={styles.dragHandle} title={isSearching ? "Clear search to reorder" : "Drag to reorder"}>
                    <GripVertical size={18} opacity={isSearching ? 0.3 : 1} />
                  </div>
                  
                  <div className={styles.listColLogo}>
                    <img src={item.imageUrl} alt={item.name} style={{ width: "70px", height: "35px", objectFit: "contain" }} />
                  </div>
                  
                  <div className={styles.listColName}>
                    {item.name}
                  </div>
                  
                  <div className={styles.listColUrl}>
                    {item.website ? (
                      <a href={item.website} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "none" }}>
                        {item.website}
                      </a>
                    ) : (
                      <span style={{ opacity: 0.5 }}>-</span>
                    )}
                  </div>
                  
                  <div className={styles.listColActions}>
                    <div className={styles.actionButtons}>
                      <button className={styles.btnEdit} title="Edit" onClick={() => startEdit(item)}>
                        <Edit2 size={16} />
                      </button>
                      <button className={styles.btnDelete} title="Delete" onClick={() => handleDelete(item.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
