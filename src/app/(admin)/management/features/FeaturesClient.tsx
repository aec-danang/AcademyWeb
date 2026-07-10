"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFeature, updateFeature, deleteFeature, batchDeleteFeatures, batchUpdateFeatures } from "./actions";
import { Plus, Edit2, Trash2, GripVertical, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type SiteFeature = {
  id: string;
  title: string;
  description: string;
  iconValue: string;
  order: number;
  published: boolean;
};

export default function FeaturesClient({ initialFeatures }: { initialFeatures: SiteFeature[] }) {
  const router = useRouter();
  const [features, setFeatures] = useState([...initialFeatures].sort((a, b) => a.order - b.order));
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: "", description: "", iconValue: "", published: true });
  const [isCreating, setIsCreating] = useState(false);

  const filteredFeatures = features.filter(f => 
    f.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
    try {
      const newOrder = features.length > 0 ? Math.max(...features.map(f => f.order)) + 1 : 1;
      await createFeature({ ...formData, order: newOrder });
      setIsCreating(false);
      setFormData({ title: "", description: "", iconValue: "", published: true });
      toast.success("Feature created successfully.");
      router.refresh();
      setTimeout(() => window.location.reload(), 500); // Hack to ensure full reload since we don't return updated data
    } catch (err) {
      toast.error("Failed to create feature.");
    }
  };

  const handleUpdate = async () => {
    if (isEditing) {
      try {
        const featureToEdit = features.find(f => f.id === isEditing);
        if (featureToEdit) {
          await updateFeature(isEditing, { ...formData, order: featureToEdit.order });
          setFeatures(prev => prev.map(f => f.id === isEditing ? { ...f, ...formData } : f));
          setIsEditing(null);
          toast.success("Feature updated successfully.");
          router.refresh();
        }
      } catch (err) {
        toast.error("Failed to update feature.");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this feature?")) {
      try {
        await deleteFeature(id);
        setFeatures(prev => prev.filter(f => f.id !== id));
        toast.success("Feature deleted successfully.");
        router.refresh();
      } catch (err) {
        toast.error("Failed to delete feature.");
      }
    }
  };

  const startEdit = (feature: SiteFeature) => {
    setIsEditing(feature.id);
    setIsCreating(false);
    setFormData({
      title: feature.title,
      description: feature.description,
      iconValue: feature.iconValue,
      published: feature.published,
    });
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setIsCreating(false);
  };

  return (
    <div className="space-y-6 relative pb-20">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Manage Features</h2>
        <p className="text-slate-500 dark:text-slate-400">Manage the 'Key Features' section displayed on the landing page.</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Search features by title..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 w-full h-10 shadow-sm focus-visible:ring-1 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-600 transition-shadow"
            />
          </div>
        </div>
        <Button 
          className="bg-orange hover:bg-orange-hover text-white h-10 shadow-sm w-full sm:w-auto transition-colors" 
          onClick={() => {
            setIsCreating(true);
            setFormData({ title: "", description: "", iconValue: "", published: true });
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Feature
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80 dark:bg-slate-800/40 backdrop-blur-sm">
            <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
              <TableHead className="w-[120px] text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4">Icon</TableHead>
              <TableHead className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4">Feature Details</TableHead>
              <TableHead className="w-[120px] text-center text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4">Status</TableHead>
              <TableHead className="w-[120px] text-right text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4 px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFeatures.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center text-slate-500 dark:text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Search className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                    <p>No features found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredFeatures.map((item) => (
                  <TableRow key={item.id} className="group border-slate-200 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <TableCell className="py-3 font-mono text-sm text-slate-500">
                      {item.iconValue}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</span>
                        <span className="text-sm text-slate-500 line-clamp-1">{item.description}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={item.published 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" 
                        : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"}>
                        {item.published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900" onClick={() => startEdit(item)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              )
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isCreating || isEditing !== null} onOpenChange={(open) => !open && cancelEdit()}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">{isCreating ? "Add New Feature" : "Edit Feature"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Title</label>
              <Input 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Description</label>
              <RichTextEditor
                content={formData.description}
                onChange={content => setFormData({...formData, description: content})}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Icon (Lucide Name)</label>
              <Input 
                value={formData.iconValue} 
                onChange={e => setFormData({...formData, iconValue: e.target.value})} 
                placeholder="e.g. graduation-cap, book-open"
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="published" 
                checked={formData.published} 
                onChange={e => setFormData({...formData, published: e.target.checked})}
                className="rounded border-slate-300"
              />
              <label htmlFor="published" className="text-sm font-medium">Published</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={cancelEdit}>Cancel</Button>
            <Button className="bg-orange hover:bg-orange-hover text-white" onClick={isCreating ? handleCreate : handleUpdate}>
              {isCreating ? "Add Feature" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
