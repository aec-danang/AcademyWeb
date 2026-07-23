"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTestimonial, updateTestimonial, deleteTestimonial } from "./actions";
import { Plus, Edit2, Trash2, Search, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";

type Testimonial = {
  id: string;
  authorName: string;
  authorRole: string | null;
  content: string;
  avatarUrl: string | null;
  rating: number;
  published: boolean;
  order: number;
  score: string | null;
  isHallOfFame: boolean;
  isFeatured: boolean;
};

type FormData = {
  authorName: string;
  authorRole: string;
  content: string;
  avatarUrl: string;
  rating: number;
  published: boolean;
  score: string;
  isHallOfFame: boolean;
  isFeatured: boolean;
};

const EMPTY_FORM: FormData = {
  authorName: "", authorRole: "", content: "", avatarUrl: "",
  rating: 5, published: true, score: "", isHallOfFame: false, isFeatured: false,
};

export default function TestimonialsClient({ initialTestimonials }: { initialTestimonials: Testimonial[] }) {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState([...initialTestimonials].sort((a, b) => a.order - b.order));
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog state
  const [dialogMode, setDialogMode] = useState<"none" | "create" | "edit">("none");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredTestimonials = testimonials.filter((t) =>
    t.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ─── Open helpers ─────────────────────────────────────────────────────────────

  const openCreate = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setDialogMode("create");
  };

  const openEdit = (t: Testimonial) => {
    setFormData({
      authorName: t.authorName,
      authorRole: t.authorRole || "",
      content: t.content,
      avatarUrl: t.avatarUrl || "",
      rating: t.rating,
      published: t.published,
      score: t.score || "",
      isHallOfFame: t.isHallOfFame,
      isFeatured: t.isFeatured,
    });
    setEditingId(t.id);
    setDialogMode("edit");
  };

  const closeDialog = () => {
    setDialogMode("none");
    setEditingId(null);
  };

  // ─── CRUD ─────────────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!formData.authorName || !formData.content) {
      toast.error("Author name and content are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const newOrder = testimonials.length > 0 ? Math.max(...testimonials.map((t) => t.order)) + 1 : 1;
      await createTestimonial({
        ...formData,
        authorRole: formData.authorRole || null,
        avatarUrl: formData.avatarUrl || null,
        score: formData.score || null,
        order: newOrder,
      });
      closeDialog();
      toast.success("Testimonial created successfully.");
      router.refresh();
    } catch {
      toast.error("Failed to create testimonial.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    if (!formData.authorName || !formData.content) {
      toast.error("Author name and content are required.");
      return;
    }
    const testimonialToEdit = testimonials.find((t) => t.id === editingId);
    if (!testimonialToEdit) return;

    setIsSubmitting(true);
    // Optimistic update + close dialog immediately
    setTestimonials((prev) =>
      prev.map((t) =>
        t.id === editingId
          ? {
              ...t,
              ...formData,
              authorRole: formData.authorRole || null,
              avatarUrl: formData.avatarUrl || null,
              score: formData.score || null,
            }
          : t
      )
    );
    closeDialog();

    try {
      await updateTestimonial(editingId, {
        ...formData,
        authorRole: formData.authorRole || null,
        avatarUrl: formData.avatarUrl || null,
        score: formData.score || null,
        order: testimonialToEdit.order,
      });
      toast.success("Testimonial updated successfully.");
      router.refresh();
    } catch {
      // Rollback optimistic update
      setTestimonials([...initialTestimonials].sort((a, b) => a.order - b.order));
      toast.error("Failed to update testimonial. Changes reverted.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      await deleteTestimonial(id);
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
      toast.success("Testimonial deleted successfully.");
      router.refresh();
    } catch {
      toast.error("Failed to delete testimonial.");
    }
  };

  const isDialogOpen = dialogMode !== "none";

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 relative pb-20">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Manage Testimonials</h2>
        <p className="text-slate-500 dark:text-slate-400">Manage student reviews, scores, and Hall of Fame entries.</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by author or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 w-full h-10 shadow-sm focus-visible:ring-1 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-600 transition-shadow"
            />
          </div>
        </div>
        <Button
          className="bg-orange hover:bg-orange-hover text-white h-10 shadow-sm w-full sm:w-auto transition-colors"
          onClick={openCreate}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Testimonial
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80 dark:bg-slate-800/40 backdrop-blur-sm">
            <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
              <TableHead className="w-[200px] text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4 pl-6">Author</TableHead>
              <TableHead className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4">Content & Score</TableHead>
              <TableHead className="w-[140px] text-center text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4">Flags</TableHead>
              <TableHead className="w-[100px] text-right text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4 px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTestimonials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center text-slate-500 dark:text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Search className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                    <p>No testimonials found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTestimonials.map((item) => (
                <TableRow key={item.id} className="group border-slate-200 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700">
                        <AvatarImage src={item.avatarUrl || ""} alt={item.authorName} />
                        <AvatarFallback className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-semibold">
                          {item.authorName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{item.authorName}</span>
                        {item.authorRole && <span className="text-xs text-slate-500">{item.authorRole}</span>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] md:max-w-[400px] lg:max-w-[600px] whitespace-normal">
                    <div className="flex flex-col gap-1.5 py-1">
                      {item.score && (
                        <span className="inline-flex items-center text-xs font-bold text-orange dark:text-orange-400 uppercase">
                          <Star className="h-3 w-3 mr-1 fill-current" /> {item.score}
                        </span>
                      )}
                      <span className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 italic">"{item.content}"</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col gap-1 items-center">
                      {item.isHallOfFame && <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-none dark:bg-amber-900/30 dark:text-amber-400 text-[10px] px-1.5 py-0">Hall of Fame</Badge>}
                      {item.isFeatured && <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-none dark:bg-blue-900/30 dark:text-blue-400 text-[10px] px-1.5 py-0">Featured</Badge>}
                      {!item.published && <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-slate-500">Draft</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-orange hover:bg-orange/10" onClick={() => openEdit(item)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open && !isSubmitting) closeDialog(); }}>
        <DialogContent className="sm:max-w-[600px] rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-[#0b101e]">
          <div className="bg-slate-50/80 dark:bg-slate-900/50 px-6 py-5 border-b border-slate-100 dark:border-slate-800/80">
            <DialogTitle className="text-xl text-slate-900 dark:text-slate-100">
              {dialogMode === "create" ? "Add Testimonial" : "Edit Testimonial"}
            </DialogTitle>
          </div>
          <div className="max-h-[60vh] overflow-y-auto px-6 py-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-200">Author Name <span className="text-red-500">*</span></label>
                <Input
                  className="h-11 rounded-xl bg-slate-50/50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-orange focus-visible:border-orange dark:text-slate-100 shadow-sm"
                  value={formData.authorName}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                  placeholder="e.g. Nguyen Van A"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-200">Author Role <span className="text-slate-400 font-normal">(Optional)</span></label>
                <Input
                  className="h-11 rounded-xl bg-slate-50/50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-orange focus-visible:border-orange dark:text-slate-100 shadow-sm"
                  value={formData.authorRole}
                  onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                  placeholder="e.g. IELTS Student"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-200">Content <span className="text-red-500">*</span></label>
              <Textarea
                className="rounded-xl resize-none bg-slate-50/50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-orange focus-visible:border-orange dark:text-slate-100 shadow-sm"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
                placeholder="What the student said..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-200">Avatar URL <span className="text-slate-400 font-normal">(Optional)</span></label>
                <Input
                  className="h-11 rounded-xl bg-slate-50/50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-orange focus-visible:border-orange dark:text-slate-100 shadow-sm"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-200">High Score <span className="text-slate-400 font-normal">(Optional)</span></label>
                <Input
                  className="h-11 rounded-xl bg-slate-50/50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-orange focus-visible:border-orange dark:text-slate-100 shadow-sm"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                  placeholder="e.g. IELTS 8.0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <Switch
                  id="isHallOfFame"
                  checked={formData.isHallOfFame}
                  onCheckedChange={(checked) => setFormData({ ...formData, isHallOfFame: checked })}
                  className="data-[state=checked]:bg-orange"
                />
                <div className="flex flex-col">
                  <label htmlFor="isHallOfFame" className="text-sm font-semibold dark:text-slate-200 cursor-pointer">Hall of Fame</label>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Add to Hall of Fame</span>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                  className="data-[state=checked]:bg-orange"
                />
                <div className="flex flex-col">
                  <label htmlFor="isFeatured" className="text-sm font-semibold dark:text-slate-200 cursor-pointer">Featured</label>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Pin to the front page</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 mt-2">
              <div className="flex flex-col">
                <label htmlFor="published" className="text-sm font-semibold dark:text-slate-200 cursor-pointer">Published</label>
                <span className="text-xs text-slate-500 dark:text-slate-400">Make this testimonial visible publicly</span>
              </div>
              <Switch
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                className="data-[state=checked]:bg-orange"
              />
            </div>
          </div>
          <div className="px-6 py-5 bg-slate-50/80 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 flex justify-end gap-3">
            <Button
              variant="outline"
              className="rounded-xl font-semibold h-11 px-5 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300"
              onClick={closeDialog}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl font-semibold h-11 px-6 bg-orange hover:bg-orange-hover text-white shadow-md shadow-orange/20 min-w-[140px]"
              onClick={dialogMode === "create" ? handleCreate : handleUpdate}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : dialogMode === "create" ? "Add Testimonial" : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
