"use client";

import { useState } from "react";
import { createPost, updatePost, deletePost } from "./actions";
import styles from "../admin.module.css";
import { Plus, Edit2, Trash2, Search, X } from "lucide-react";

type Post = {
  title: string;
  content: string;
  slug: string;
  type: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  authorId: string | null;
  excerpt: string | null;
  featuredImage: string | null;
  metaDescription: string | null;
  metaTitle: string | null;
};

export default function PostsClient({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState([...initialPosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    title: "", slug: "", content: "", excerpt: "", featuredImage: "", type: "post", published: true 
  });
  const [isCreating, setIsCreating] = useState(false);

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
    if (!formData.title || !formData.slug) return alert("Title and slug are required.");
    await createPost({ ...formData, excerpt: formData.excerpt || null, featuredImage: formData.featuredImage || null });
    window.location.reload();
  };

  const handleUpdate = async () => {
    if (!formData.title || !formData.slug) return alert("Title and slug are required.");
    if (isEditing) {
      await updatePost(isEditing, { ...formData, excerpt: formData.excerpt || null, featuredImage: formData.featuredImage || null });
      window.location.reload();
    }
  };

  const handleDelete = async (slug: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      await deletePost(slug);
      window.location.reload();
    }
  };

  const startEdit = (post: Post) => {
    setIsEditing(post.slug);
    setIsCreating(false);
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || "",
      featuredImage: post.featuredImage || "",
      type: post.type,
      published: post.published,
    });
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setIsCreating(false);
  };

  return (
    <div>
      <div className={styles.flexBetween} style={{ alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0 }}>Manage Posts</h2>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <div className={styles.formGroup} style={{ marginBottom: 0, position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input 
              type="text" 
              placeholder="Search posts..." 
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
              setIsEditing(null);
              setFormData({ title: "", slug: "", content: "", excerpt: "", featuredImage: "", type: "post", published: true });
            }}
          >
            <Plus size={18} />
            Create Post
          </button>
        </div>
      </div>

      {(isCreating || isEditing) && (
        <div className={styles.modalOverlay} onClick={cancelEdit}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: "800px" }}>
            <div className={styles.modalHeader}>
              <h3>{isCreating ? "Create New Post" : "Edit Post"}</h3>
              <button className={styles.btnClose} onClick={cancelEdit}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{ display: "flex", gap: "1.5rem" }}>
                <div className={styles.formGroup} style={{ flex: 2, marginBottom: 0 }}>
                  <label>Title</label>
                  <input 
                    type="text" 
                    placeholder="Post Title" 
                    value={formData.title} 
                    onChange={e => {
                      const newTitle = e.target.value;
                      if (isCreating) {
                        const newSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                        setFormData({...formData, title: newTitle, slug: newSlug});
                      } else {
                        setFormData({...formData, title: newTitle});
                      }
                    }} 
                  />
                </div>
                <div className={styles.formGroup} style={{ flex: 1, marginBottom: 0 }}>
                  <label>Type</label>
                  <select 
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    style={{ width: "100%", padding: "0.85rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "12px", background: "#f8fafc", fontFamily: "inherit" }}
                  >
                    <option value="post">Post</option>
                    <option value="news">News</option>
                    <option value="event">Event</option>
                    <option value="article">Article</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label>Slug (URL identifier)</label>
                <input 
                  type="text" 
                  placeholder="post-slug-url" 
                  value={formData.slug} 
                  disabled={!isCreating}
                  onChange={e => setFormData({...formData, slug: e.target.value})} 
                  style={{ opacity: isCreating ? 1 : 0.6 }}
                />
              </div>

              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label>Featured Image URL (Optional)</label>
                <input 
                  type="text" 
                  placeholder="https://example.com/image.jpg" 
                  value={formData.featuredImage} 
                  onChange={e => setFormData({...formData, featuredImage: e.target.value})} 
                />
              </div>
              
              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label>Excerpt (Short description)</label>
                <textarea 
                  placeholder="A short summary of the post..." 
                  value={formData.excerpt} 
                  onChange={e => setFormData({...formData, excerpt: e.target.value})} 
                  rows={3}
                />
              </div>

              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label>Content</label>
                <textarea 
                  placeholder="Full post content..." 
                  value={formData.content} 
                  onChange={e => setFormData({...formData, content: e.target.value})} 
                  rows={8}
                />
              </div>
              
              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input 
                    type="checkbox" 
                    checked={formData.published} 
                    onChange={e => setFormData({...formData, published: e.target.checked})} 
                    style={{ width: "auto" }}
                  />
                  <span>Published (visible to public)</span>
                </label>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", justifyContent: "flex-end", borderTop: "1px solid #f1f5f9", paddingTop: "1.5rem" }}>
                <button className="btn-secondary" onClick={cancelEdit}>Cancel</button>
                <button className="btn-primary" onClick={isCreating ? handleCreate : handleUpdate}>{isCreating ? "Create Post" : "Save Changes"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.cardPanel}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                  No posts found.
                </td>
              </tr>
            ) : (
              filteredPosts.map((item) => (
                <tr key={item.slug}>
                  <td style={{ fontWeight: 500 }}>
                    {item.title}
                    <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "0.25rem" }}>/{item.slug}</div>
                  </td>
                  <td>
                    <span style={{ textTransform: "capitalize", padding: "0.25rem 0.75rem", background: "#f1f5f9", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 600 }}>
                      {item.type}
                    </span>
                  </td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`${styles.badge} ${item.published ? styles.badgeSuccess : styles.badgeWarning}`}>
                      {item.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button className={styles.btnEdit} title="Edit" onClick={() => startEdit(item)}>
                        <Edit2 size={16} />
                      </button>
                      <button className={styles.btnDelete} title="Delete" onClick={() => handleDelete(item.slug)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
