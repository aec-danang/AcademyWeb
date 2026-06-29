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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type Post = {
  title: string;
  content: string;
  slug: string;
  type: string;
  published: boolean;
  excerpt: string | null;
  featuredImage: string | null;
};

const SettingsForm = ({ formData, setFormData }: { formData: any, setFormData: any }) => (
  <div className="flex flex-col gap-6">
    <div className="grid gap-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">URL Slug</label>
      <Input 
        type="text" 
        value={formData.slug} 
        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
        placeholder="post-slug"
        className="bg-slate-50 dark:bg-slate-900"
      />
    </div>

    <div className="grid gap-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Featured Image URL</label>
      <Input 
        type="text" 
        placeholder="https://..."
        value={formData.featuredImage} 
        onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
        className="bg-slate-50 dark:bg-slate-900"
      />
      {formData.featuredImage && (
        <div className="mt-2 rounded-md overflow-hidden border border-slate-200 dark:border-slate-800 flex items-center justify-center bg-slate-100 dark:bg-slate-900 min-h-20 relative aspect-video">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={formData.featuredImage} alt="Featured Preview" className="absolute inset-0 w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} onLoad={(e) => { e.currentTarget.style.display = 'block'; }} />
        </div>
      )}
    </div>

    <div className="grid gap-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Excerpt</label>
      <Textarea 
        rows={4}
        placeholder="Brief summary of the post..."
        value={formData.excerpt} 
        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
        className="resize-y bg-slate-50 dark:bg-slate-900"
      />
    </div>
  </div>
);



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
    <div className="max-w-7xl mx-auto py-4 flex flex-col flex-1 w-full space-y-6">
      {/* Top Bar */}
      <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md z-10 -mx-6 px-6 -mt-4 pt-4 lg:mx-0 lg:px-0 lg:mt-0 lg:pt-0 lg:bg-transparent lg:backdrop-blur-none">
        <Button 
          variant="ghost"
          onClick={() => router.push("/management/posts")}
          className="text-slate-600 dark:text-slate-400 hover:text-navy dark:hover:text-white -ml-2 shrink-0"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>

        <Input
          type="text"
          placeholder="Untitled Post"
          value={formData.title}
          className="flex-1 text-lg md:text-xl font-semibold border-none bg-transparent shadow-none focus-visible:ring-0 px-0 placeholder:text-slate-400 dark:placeholder:text-slate-600 text-navy dark:text-slate-100 min-w-0"
          onChange={(e) => {
            const newTitle = e.target.value;
            if (!isEditing) {
              setFormData({ ...formData, title: newTitle, slug: generateSlug(newTitle) });
            } else {
              setFormData({ ...formData, title: newTitle });
            }
          }}
        />

        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar shrink-0">
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger className="w-[110px] h-9 bg-white dark:bg-slate-900 shrink-0">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="post">Post</SelectItem>
              <SelectItem value="news">News</SelectItem>
              <SelectItem value="event">Event</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 shrink-0">
            <Checkbox 
              id="published-top" 
              checked={formData.published} 
              onCheckedChange={(checked) => setFormData({...formData, published: checked === true})} 
            />
            <label 
              htmlFor="published-top" 
              className="text-sm font-medium leading-none cursor-pointer whitespace-nowrap text-slate-700 dark:text-slate-300"
            >
              Publish
            </label>
          </div>

          <Button 
            variant="outline"
            onClick={() => setShowSettings(true)}
            className="shrink-0 h-9"
          >
            <Settings className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-orange hover:bg-orange-hover text-white rounded-full px-4 sm:px-6 shadow-sm shrink-0 h-9"
          >
            <Save className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save"}</span>
            <span className="sm:hidden">{isSaving ? "..." : "Save"}</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col flex-1 max-w-4xl mx-auto w-full pt-4">
        {/* Main Editor Column */}
        <div className="flex flex-col gap-4 flex-1 min-w-0">

          <SimpleEditor
            content={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
          />
        </div>
      </div>

      {/* Settings Sheet (Mobile) */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent side="right" className="w-full sm:w-[400px] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Post Settings</SheetTitle>
          </SheetHeader>
          <SettingsForm formData={formData} setFormData={setFormData} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
