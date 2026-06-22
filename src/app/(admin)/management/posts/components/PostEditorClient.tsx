"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPost, updatePost } from "../actions";
import { ArrowLeft, Save, Image as ImageIcon, Settings, X } from "lucide-react";
import SimpleEditor from "./SimpleEditor";
import styles from "../../admin.module.css";

type Post = {
  title: string;
  content: string;
  slug: string;
  type: string;
  published: boolean;
  excerpt: string | null;
  featuredImage: string | null;
};

export default function PostEditorClient({ initialData }: { initialData?: Post }) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    content: initialData?.content || "",
    excerpt: initialData?.excerpt || "",
    featuredImage: initialData?.featuredImage || "",
    type: initialData?.type || "post",
    published: initialData?.published ?? true,
  });

  const [showSettings, setShowSettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.title || !formData.slug) return alert("Title and slug are required.");
    setIsSaving(true);
    
    try {
      if (isEditing && initialData) {
        await updatePost(initialData.slug, { ...formData, excerpt: formData.excerpt || null, featuredImage: formData.featuredImage || null });
      } else {
        await createPost({ ...formData, excerpt: formData.excerpt || null, featuredImage: formData.featuredImage || null });
      }
      router.push("/management/posts");
    } catch (error) {
      console.error(error);
      alert("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "1rem 0", display: "flex", flexDirection: "column", flex: 1 }}>
      {/* Top Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
        <button 
          onClick={() => router.push("/management/posts")}
          className={styles.topActionButton}
        >
          <ArrowLeft size={18} />
          Back to Posts
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`${styles.topActionButton} ${showSettings ? styles.active : ''}`}
          >
            <Settings size={18} />
            Settings
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            style={{ 
              display: "flex", alignItems: "center", gap: "0.5rem", 
              background: "var(--color-orange)", color: "white", 
              border: "none", borderRadius: "20px", padding: "0.5rem 1.25rem", 
              cursor: isSaving ? "not-allowed" : "pointer", fontSize: "0.9rem",
              opacity: isSaving ? 0.7 : 1
            }}
          >
            <Save size={18} />
            {isSaving ? "Saving..." : (formData.published ? "Publish" : "Save Draft")}
          </button>
        </div>
      </div>

      {/* Main Editor */}
      <div style={{ display: "flex", gap: "3rem", flex: 1 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            className={`${styles.editorInput} ${styles.editorTitle}`}
            onChange={(e) => {
              const newTitle = e.target.value;
              if (!isEditing) {
                setFormData({ ...formData, title: newTitle, slug: generateSlug(newTitle) });
              } else {
                setFormData({ ...formData, title: newTitle });
              }
            }}
          />

          <SimpleEditor
            content={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
          />
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className={styles.modalOverlay} onClick={() => setShowSettings(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button 
                className={styles.modalClose} 
                onClick={() => setShowSettings(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
              
              <h3 style={{ fontSize: "1.25rem", marginBottom: "1.5rem", marginTop: 0 }}>Post Settings</h3>
              
              <div className={styles.formGroup}>
                <label>Slug</label>
                <input 
                  type="text" 
                  value={formData.slug} 
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Type</label>
                <select 
                  value={formData.type} 
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="post">Post</option>
                  <option value="news">News</option>
                  <option value="event">Event</option>
                  <option value="article">Article</option>
                  <option value="page">Page</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Featured Image URL</label>
                <input 
                  type="text" 
                  placeholder="https://..."
                  value={formData.featuredImage} 
                  onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Excerpt</label>
                <textarea 
                  rows={4}
                  value={formData.excerpt} 
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  style={{ resize: "vertical" }}
                />
              </div>

              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", margin: 0 }}>
                  <input 
                    type="checkbox" 
                    checked={formData.published} 
                    onChange={e => setFormData({...formData, published: e.target.checked})} 
                    style={{ width: "auto" }}
                  />
                  <span style={{ fontWeight: 400 }}>Published</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
