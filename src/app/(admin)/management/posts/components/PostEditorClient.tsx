"use client";

import { useState, KeyboardEvent, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createPost, updatePost, autoClassifyByAI } from "../actions";
import { ArrowLeft, Save, Image as ImageIcon, Settings, X, Tag as TagIcon, Eye, Check, Calendar, Globe, AlertCircle, Sparkles, MoreHorizontal, Wand2, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(() => import("@/components/ui/rich-text-editor").then(mod => mod.RichTextEditor), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl" />
});
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DevicePreviewModal } from "@/components/editor/device-preview-modal";
import { ValidationChecklist } from "@/components/editor/editor-validation-checklist";
import { toast } from "sonner";

type Post = {
  title: string;
  content: string;
  slug: string;
  type: string;
  published: boolean;
  excerpt: string | null;
  featuredImage: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  categories?: string[];
  tags?: string[];
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
    published: initialData?.published ?? false,
    metaTitle: initialData?.metaTitle || "",
    metaDescription: initialData?.metaDescription || "",
    canonicalUrl: initialData?.canonicalUrl || "",
    categories: initialData?.categories || [],
    tags: initialData?.tags || [],
  });

  const [tagInput, setTagInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);



  // Auto-save draft local timer notification
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.title.trim()) {
        setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [formData]);

  const handleSave = useCallback(async (publishState: boolean = formData.published) => {
    if (!formData.title || !formData.slug) {
      toast.error("Title and URL Slug are required.");
      return;
    }
    setIsSaving(true);
    
    const payload = {
      ...formData,
      published: publishState,
      excerpt: formData.excerpt || null,
      featuredImage: formData.featuredImage || null,
      metaTitle: formData.metaTitle || null,
      metaDescription: formData.metaDescription || null,
      canonicalUrl: formData.canonicalUrl || null,
    };

    try {
      if (isEditing && initialData) {
        await updatePost(initialData.slug, payload);
        toast.success("Post updated successfully!");
      } else {
        await createPost(payload);
        toast.success("New post created!");
      }
      router.push("/management/posts");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save post.");
    } finally {
      setIsSaving(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, isEditing, initialData]);

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave(formData.published);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, formData.published]);

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleAutoClassify = async () => {
    if (!formData.title && !formData.content) {
      toast.error("Vui lòng nhập tiêu đề hoặc nội dung trước khi phân loại.");
      return;
    }
    setIsClassifying(true);
    try {
      // Strip HTML tags for clean text to save tokens
      const cleanContent = formData.content.replace(/<[^>]*>?/gm, '');
      const result = await autoClassifyByAI(formData.title, cleanContent);
      
      const newTags = Array.from(new Set([...formData.tags, ...(result.tags || [])]));

      setFormData(prev => ({
        ...prev,
        type: result.type || 'post',
        tags: newTags
      }));

      toast.success(`AI phân loại: ${
        result.type === 'recruitment' ? 'Tuyển dụng' : 
        result.type === 'news' ? 'Tin tức' : 
        result.type === 'event' ? 'Sự kiện' : 'Blog'
      }`, { icon: '🤖' });
    } catch (e) {
      toast.error("Lỗi khi kết nối AI phân loại.");
    } finally {
      setIsClassifying(false);
    }
  };

  const handleAddTag = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
  };

  const handleAddCategory = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && categoryInput.trim() !== '') {
      e.preventDefault();
      if (!formData.categories.includes(categoryInput.trim())) {
        setFormData({ ...formData, categories: [...formData.categories, categoryInput.trim()] });
      }
      setCategoryInput('');
    }
  };

  const handleRemoveCategory = (catToRemove: string) => {
    setFormData({ ...formData, categories: formData.categories.filter(c => c !== catToRemove) });
  };

  const metaDescLength = formData.metaDescription ? formData.metaDescription.length : 0;
  const isMetaDescOptimal = metaDescLength >= 120 && metaDescLength <= 160;

  // Content statistics
  const plainTextContent = formData.content.replace(/<[^>]*>/g, '').trim();
  const wordCount = plainTextContent ? plainTextContent.split(/\s+/).length : 0;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full bg-slate-50 dark:bg-slate-950 overflow-hidden fixed inset-0 top-16 z-20">
      
      {/* Main Container: Top Toolbar + Editor Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full border-r border-slate-200 dark:border-slate-800">
        
        {/* Top Minimal Toolbar */}
        <div className="h-14 border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 px-6 flex items-center justify-between shrink-0 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/management/posts')} className="h-8 px-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Quay lại</span>
            </Button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-xs font-semibold text-slate-500 truncate max-w-[200px] sm:max-w-xs">
              {formData.title || "Bài viết chưa đặt tiêu đề"}
            </span>
            {lastSaved && (
              <span className="hidden md:inline text-[11px] text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-full">
                Đã lưu {lastSaved}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewOpen(true)}
              className="h-8 px-3 text-xs font-semibold rounded-lg gap-1.5 cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Xem trước</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="h-8 px-3 text-xs font-semibold rounded-lg gap-1.5 cursor-pointer"
            >
              <Save className="h-3.5 w-3.5 text-slate-500" />
              <span>Lưu nháp</span>
            </Button>

            <Button
              size="sm"
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="h-8 px-4 text-xs font-bold bg-orange hover:bg-orange-hover text-white rounded-lg gap-1.5 cursor-pointer shadow-xs"
            >
              {isSaving ? "Đang xuất bản..." : "Xuất bản bài viết"}
            </Button>
          </div>
        </div>

        {/* Main Editor Center Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12 bg-white dark:bg-slate-950">
          <div className="max-w-3xl mx-auto w-full flex flex-col gap-6">
            
            {/* Title Input */}
            <input
              type="text"
              placeholder="Nhập tiêu đề bài viết..."
              value={formData.title}
              className="w-full text-3xl md:text-5xl font-extrabold bg-transparent border-none outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700 text-slate-900 dark:text-white tracking-tight"
              onChange={(e) => {
                const newTitle = e.target.value;
                if (!isEditing) {
                  setFormData({ ...formData, title: newTitle, slug: generateSlug(newTitle) });
                } else {
                  setFormData({ ...formData, title: newTitle });
                }
              }}
            />

            {/* Rich Text Editor */}
            <RichTextEditor
              content={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
            />

            {/* Content Statistics Footbar */}
            <div className="flex items-center gap-4 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-900 pt-4 font-mono">
              <span>Số từ: {wordCount}</span>
              <span>Ký tự: {plainTextContent.length}</span>
              <span>Thời gian đọc: ~{readingTime} phút</span>
            </div>

          </div>
        </div>
      </div>

      {/* Right Sidebar (Settings, SEO & Metadata) - Permanently Visible */}
      <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 flex flex-col overflow-y-auto shrink-0 z-10">
        
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-sm text-slate-900 dark:text-slate-100">
          Cài đặt bài viết
        </div>

        <div className="p-5 space-y-6">
          
          {/* Validation Checklist */}
          <ValidationChecklist
            title={formData.title}
            slug={formData.slug}
            content={formData.content}
            excerpt={formData.excerpt}
            featuredImage={formData.featuredImage}
            metaDescription={formData.metaDescription}
          />

          {/* Publishing Settings */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Globe className="h-3.5 w-3.5" /> Thông tin xuất bản
            </h4>
            
            <div className="grid gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Trạng thái</label>
              <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <Checkbox id="published-status" checked={formData.published} onCheckedChange={(checked) => setFormData({...formData, published: checked === true})} />
                <label htmlFor="published-status" className="text-xs font-semibold cursor-pointer">Xuất bản công khai lên website</label>
              </div>
            </div>

            <div className="grid gap-1.5 relative">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Loại bài viết</label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-5 px-1.5 text-[10px] text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  onClick={handleAutoClassify}
                  disabled={isClassifying}
                >
                  {isClassifying ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Wand2 className="h-3 w-3 mr-1" />}
                  {isClassifying ? 'AI đang đọc...' : 'AI Phân loại'}
                </Button>
              </div>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger className="bg-white dark:bg-slate-900 text-xs h-9">
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="post">Bài viết Blog</SelectItem>
                  <SelectItem value="news">Tin tức học viện</SelectItem>
                  <SelectItem value="event">Sự kiện nổi bật</SelectItem>
                  <SelectItem value="recruitment">Tuyển dụng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Đường dẫn URL (Slug)</label>
              <Input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="bg-white dark:bg-slate-900 font-mono text-xs h-9" />
            </div>
          </div>

          {/* Media & Excerpt */}
          <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ImageIcon className="h-3.5 w-3.5" /> Ảnh đại diện
            </h4>
            
            <div className="grid gap-2">
              <Input type="text" placeholder="https://..." value={formData.featuredImage} onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })} className="bg-white dark:bg-slate-900 text-xs h-9" />
              {formData.featuredImage && (
                <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 aspect-video">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={formData.featuredImage} alt="Featured" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>
              )}
            </div>

            <div className="grid gap-1.5 mt-3">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tóm tắt ngắn (Excerpt)</label>
              <Textarea rows={3} placeholder="Mô tả ngắn gọn nội dung bài viết..." value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} className="resize-none bg-white dark:bg-slate-900 text-xs" />
            </div>
          </div>

          {/* Taxonomies */}
          <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <TagIcon className="h-3.5 w-3.5" /> Chuyên mục & Thẻ
            </h4>
            
            <div className="grid gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Chuyên mục</label>
              <Input type="text" placeholder="Nhập chuyên mục & nhấn Enter" value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)} onKeyDown={handleAddCategory} className="bg-white dark:bg-slate-900 text-xs h-9" />
              <div className="flex flex-wrap gap-1.5 mt-1">
                {formData.categories.map(cat => (
                  <Badge key={cat} variant="secondary" className="flex items-center gap-1 text-[11px] py-0.5">
                    {cat} <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => handleRemoveCategory(cat)} />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Thẻ (Tags)</label>
              <Input type="text" placeholder="Nhập thẻ & nhấn Enter" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} className="bg-white dark:bg-slate-900 text-xs h-9" />
              <div className="flex flex-wrap gap-1.5 mt-1">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="flex items-center gap-1 text-[11px] py-0.5">
                    #{tag} <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => handleRemoveTag(tag)} />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* SEO Panel */}
          <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-5 pb-8">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Globe className="h-3.5 w-3.5" /> Cấu hình SEO
            </h4>
            
            <div className="grid gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tiêu đề SEO (Meta Title)</label>
              <Input type="text" placeholder="Tiêu đề SEO hiển thị trên Google" value={formData.metaTitle} onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })} className="bg-white dark:bg-slate-900 text-xs h-9" />
            </div>

            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Mô tả SEO (Meta Description)</label>
                <span className={`text-[10px] ${isMetaDescOptimal ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {metaDescLength}/160
                </span>
              </div>
              <Textarea rows={3} placeholder="Viết câu mô tả ngắn gọn hấp dẫn cho công cụ tìm kiếm..." value={formData.metaDescription} onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })} className="resize-none bg-white dark:bg-slate-900 text-xs" />
            </div>
          </div>

        </div>
      </div>

      {/* Device Preview Modal */}
      <DevicePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={formData.title}
        content={formData.content}
        featuredImage={formData.featuredImage}
      />
    </div>
  );
}
