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
    if (!confirm("Bạn có chắc chắn muốn xóa cảm nhận này không?")) return;
    try {
      await deleteTestimonial(id);
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
      toast.success("Đã xóa cảm nhận thành công.");
      router.refresh();
    } catch {
      toast.error("Xóa thất bại.");
    }
  };

  const isDialogOpen = dialogMode !== "none";

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 relative pb-20">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Quản lý Cảm nhận học viên</h2>
        <p className="text-slate-500 dark:text-slate-400">Quản lý đánh giá, cảm nghĩ, điểm số và các gương mặt tiêu biểu (Hall of Fame).</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc nội dung..."
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
          Thêm cảm nhận
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80 dark:bg-slate-800/40 backdrop-blur-sm">
            <TableRow className="border-slate-200 dark:border-slate-800">
              <TableHead className="w-[220px] text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4">Học viên</TableHead>
              <TableHead className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4">Nội dung cảm nhận</TableHead>
              <TableHead className="w-[100px] text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4">Đánh giá</TableHead>
              <TableHead className="w-[110px] text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4">Điểm số</TableHead>
              <TableHead className="w-[140px] text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4">Huy hiệu</TableHead>
              <TableHead className="w-[100px] text-right text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4 px-6">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTestimonials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center text-slate-500">
                  Chưa có đánh giá nào phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              filteredTestimonials.map((item) => (
                <TableRow key={item.id} className="group border-slate-200 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={item.avatarUrl || undefined} alt={item.authorName} />
                        <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-xs">
                          {item.authorName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm text-slate-900 dark:text-slate-100">{item.authorName}</p>
                        {item.authorRole && (
                          <p className="text-xs text-slate-400 font-normal">{item.authorRole}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400 text-sm truncate max-w-[300px]">
                    "{item.content}"
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300 text-sm font-semibold">
                    {item.score || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.isHallOfFame && (
                        <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px]">
                          Hall of Fame
                        </Badge>
                      )}
                      {item.isFeatured && (
                        <Badge className="bg-orange/15 text-orange dark:text-orange-400 border-orange/20 text-[10px]">
                          Nổi bật
                        </Badge>
                      )}
                      {!item.isHallOfFame && !item.isFeatured && (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                        onClick={() => openEdit(item)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={() => handleDelete(item.id)}
                      >
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

      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-[560px] rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-[#0b101e]">
          <div className="bg-slate-50/80 dark:bg-slate-900/50 px-6 py-5 border-b border-slate-100 dark:border-slate-800/80">
            <DialogTitle className="text-xl text-slate-900 dark:text-slate-100">
              {dialogMode === "create" ? "Thêm cảm nhận học viên" : "Chỉnh sửa cảm nhận"}
            </DialogTitle>
          </div>

          <div className="px-6 py-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tên học viên *</label>
                <Input
                  className="h-10 rounded-xl bg-slate-50/50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={formData.authorName}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Khóa học / Danh hiệu</label>
                <Input
                  className="h-10 rounded-xl bg-slate-50/50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800"
                  placeholder="Ví dụ: Học viên IELTS 7.5"
                  value={formData.authorRole}
                  onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nội dung cảm nhận *</label>
              <Textarea
                rows={3}
                className="rounded-xl bg-slate-50/50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-sm resize-none"
                placeholder="Chia sẻ của học viên về chất lượng giảng dạy tại AEC..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Link Ảnh đại diện</label>
                <Input
                  className="h-10 rounded-xl bg-slate-50/50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800"
                  placeholder="https://..."
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Điểm số thành tích</label>
                <Input
                  className="h-10 rounded-xl bg-slate-50/50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800"
                  placeholder="Ví dụ: 8.0 IELTS hoặc Top 1"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: e.target.value })}
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
