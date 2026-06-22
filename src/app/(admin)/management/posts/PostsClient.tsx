"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deletePost, batchDeletePosts, batchUpdatePosts } from "./actions";
import styles from "../admin.module.css";
import { Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";

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
  const router = useRouter();
  const [posts, setPosts] = useState([...initialPosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
    setSelectedSlugs([]);
  };

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleDelete = async (slug: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      await deletePost(slug);
      window.location.reload();
    }
  };

  const toggleSelection = (slug: string) => {
    setSelectedSlugs(prev => 
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  const isAllSelected = paginatedPosts.length > 0 && paginatedPosts.every(p => selectedSlugs.includes(p.slug));

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      const pageSlugs = paginatedPosts.map(p => p.slug);
      setSelectedSlugs(prev => prev.filter(s => !pageSlugs.includes(s)));
    } else {
      const pageSlugs = paginatedPosts.map(p => p.slug);
      setSelectedSlugs(prev => Array.from(new Set([...prev, ...pageSlugs])));
    }
  };

  const handleBatchDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedSlugs.length} posts?`)) {
      await batchDeletePosts(selectedSlugs);
      window.location.reload();
    }
  };

  const handleBatchStatus = async (published: boolean) => {
    await batchUpdatePosts(selectedSlugs, { published });
    window.location.reload();
  };

  const handleBatchType = async (type: string) => {
    await batchUpdatePosts(selectedSlugs, { type });
    window.location.reload();
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) pages.push(i);
    }
    
    return pages;
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <div>
      <div className={styles.flexBetween} style={{ alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0 }}>Manage Posts</h2>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0.5rem 0.75rem" }}>
            <input 
              type="checkbox" 
              checked={isAllSelected}
              onChange={handleSelectAllToggle}
              style={{ cursor: "pointer", width: "18px", height: "18px", accentColor: "var(--color-orange)" }}
              title="Select All (Current Page)"
            />
          </div>

          <div className={styles.formGroup} style={{ marginBottom: 0, position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input 
              type="text" 
              placeholder="Search posts..." 
              value={searchQuery}
              onChange={handleSearchChange}
              style={{ paddingLeft: "2.75rem", width: "250px" }}
            />
          </div>
          <button 
            className="btn-primary" 
            style={{ display: "flex", gap: "0.5rem", alignItems: "center", whiteSpace: "nowrap" }}
            onClick={() => router.push("/management/posts/new")}
          >
            <Plus size={18} />
            Create Post
          </button>
        </div>
      </div>

      {/* Batch Actions Toolbar */}
      {selectedSlugs.length > 0 && (
        <div className={styles.cardPanel} style={{ padding: "0.75rem 1rem", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>
            {selectedSlugs.length} item{selectedSlugs.length !== 1 ? 's' : ''} selected
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button className="btn-secondary" onClick={handleBatchDelete} style={{ color: "#ef4444", borderColor: "#fca5a5", fontSize: "0.85rem", padding: "0.4rem 0.75rem" }}>Delete</button>
            <button className="btn-secondary" onClick={() => handleBatchStatus(true)} style={{ fontSize: "0.85rem", padding: "0.4rem 0.75rem" }}>Publish</button>
            <button className="btn-secondary" onClick={() => handleBatchStatus(false)} style={{ fontSize: "0.85rem", padding: "0.4rem 0.75rem" }}>Unpublish</button>
            <select 
              className="btn-secondary" 
              style={{ fontSize: "0.85rem", padding: "0.4rem 0.75rem", outline: "none", cursor: "pointer" }}
              onChange={(e) => {
                if (e.target.value) handleBatchType(e.target.value);
                e.target.value = "";
              }}
              defaultValue=""
            >
              <option value="" disabled>Change Type...</option>
              <option value="post">Post</option>
              <option value="news">News</option>
              <option value="event">Event</option>
              <option value="article">Article</option>
              <option value="page">Page</option>
            </select>
          </div>
        </div>
      )}

      {/* List Layout */}
      <div className={styles.listContainer}>
        {paginatedPosts.length === 0 ? (
          <div className={styles.listItem} style={{ justifyContent: "center", padding: "3rem" }}>
            <span style={{ color: "#64748b" }}>No posts found.</span>
          </div>
        ) : (
          paginatedPosts.map((item) => (
            <div 
              key={item.slug} 
              className={styles.listItem} 
              style={{ 
                gap: "1.5rem", 
                paddingLeft: "1.5rem",
              }}
            >
              <div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
                <input 
                  type="checkbox" 
                  checked={selectedSlugs.includes(item.slug)}
                  onChange={() => toggleSelection(item.slug)}
                  style={{ cursor: "pointer", width: "18px", height: "18px", accentColor: "var(--color-orange)" }}
                />
              </div>
              
              <div style={{ flex: "1 1 auto", minWidth: 0, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <div className={styles.listColName} style={{ padding: 0, flex: "0 0 auto", whiteSpace: "normal" }}>
                  {item.title}
                </div>
                <div className={styles.listColUrl} style={{ padding: 0, flex: "0 0 auto", whiteSpace: "normal" }}>
                  {item.slug}
                </div>
              </div>
              
              <div className={styles.listColUrl} style={{ width: "100px", flexShrink: 0, textAlign: "center", flex: "0 0 auto", whiteSpace: "normal", textTransform: "capitalize", fontWeight: 500 }}>
                {item.type}
              </div>
              
              <div className={styles.listColUrl} style={{ width: "110px", flexShrink: 0, textAlign: "center", fontSize: "0.85rem", flex: "0 0 auto", whiteSpace: "normal" }}>
                {formatDate(item.createdAt)}
              </div>
              
              <div style={{ width: "100px", flexShrink: 0, textAlign: "center" }}>
                <span className={`${styles.badge} ${item.published ? styles.badgeSuccess : styles.badgeWarning}`}>
                  {item.published ? "Published" : "Draft"}
                </span>
              </div>
              
              <div className={styles.actionButtons} style={{ width: "80px", justifyContent: "flex-end", flexShrink: 0 }}>
                <button className={styles.btnEdit} title="Edit" onClick={() => router.push(`/management/posts/${item.slug}/edit`)}>
                  <Edit2 size={16} />
                </button>
                <button className={styles.btnDelete} title="Delete" onClick={() => handleDelete(item.slug)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2rem", padding: "1rem 0" }}>
          <div style={{ color: "#64748b", fontSize: "0.9rem" }}>
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredPosts.length)} of {filteredPosts.length} entries
          </div>
          
          <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{ 
                padding: "0.5rem", 
                background: "transparent", 
                border: "none", 
                color: currentPage === 1 ? "#cbd5e1" : "#475569",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center"
              }}
            >
              <ChevronLeft size={20} />
            </button>
            
            {getPageNumbers().map(num => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                style={{
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  border: "none",
                  background: currentPage === num ? "var(--color-orange)" : "transparent",
                  color: currentPage === num ? "white" : "#475569",
                  fontWeight: currentPage === num ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {num}
              </button>
            ))}
            
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{ 
                padding: "0.5rem", 
                background: "transparent", 
                border: "none", 
                color: currentPage === totalPages ? "#cbd5e1" : "#475569",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center"
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
