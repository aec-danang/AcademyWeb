"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPost, updatePost } from "../actions";
import { ArrowLeft, Save, Image as ImageIcon, Settings, X } from "lucide-react";
import SimpleEditor from "./SimpleEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
    <div className="max-w-5xl mx-auto py-4 flex flex-col flex-1 w-full space-y-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
        <Button 
          variant="ghost"
          onClick={() => router.push("/management/posts")}
          className="text-slate-600 dark:text-slate-400 hover:text-navy dark:hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Posts
        </Button>

        <div className="flex items-center gap-4">
          <Button 
            variant={showSettings ? "secondary" : "ghost"}
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-orange hover:bg-orange-hover text-white rounded-full px-6"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : (formData.published ? "Publish" : "Save Draft")}
          </Button>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex flex-col gap-6 flex-1 min-h-[500px]">
        <div className="flex flex-col gap-4">
          <Input
            type="text"
            placeholder="Post Title"
            value={formData.title}
            className="text-3xl font-bold border-none bg-transparent shadow-none focus-visible:ring-0 px-0 h-14"
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
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Post Settings</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Slug</label>
                <Input 
                  type="text" 
                  value={formData.slug} 
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="post-slug"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="post">Post</SelectItem>
                    <SelectItem value="news">News</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="page">Page</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Featured Image URL</label>
                <Input 
                  type="text" 
                  placeholder="https://..."
                  value={formData.featuredImage} 
                  onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Excerpt</label>
                <Textarea 
                  rows={4}
                  placeholder="Brief summary of the post..."
                  value={formData.excerpt} 
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="resize-y"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="published" 
                  checked={formData.published} 
                  onCheckedChange={(checked) => setFormData({...formData, published: checked === true})} 
                />
                <label 
                  htmlFor="published" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Published
                </label>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
