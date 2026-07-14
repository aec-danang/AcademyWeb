"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTestimonial, updateTestimonial, deleteTestimonial } from "./actions";
import { Plus, Edit2, Trash2, Search, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

export default function TestimonialsClient({ initialTestimonials }: { initialTestimonials: Testimonial[] }) {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState([...initialTestimonials].sort((a, b) => a.order - b.order));
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    authorName: "", authorRole: "", content: "", avatarUrl: "", 
    rating: 5, published: true, score: "", isHallOfFame: false, isFeatured: false 
  });
  const [isCreating, setIsCreating] = useState(false);

  const filteredTestimonials = testimonials.filter(t => 
    t.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
    try {
      const newOrder = testimonials.length > 0 ? Math.max(...testimonials.map(t => t.order)) + 1 : 1;
      await createTestimonial({ 
        ...formData, 
        authorRole: formData.authorRole || null,
        avatarUrl: formData.avatarUrl || null,
        score: formData.score || null,
        order: newOrder 
      });
      setIsCreating(false);
      resetForm();
      toast.success("Testimonial created successfully.");
      router.refresh();
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      toast.error("Failed to create testimonial.");
    }
  };

  const handleUpdate = async () => {
    if (isEditing) {
      try {
        const testimonialToEdit = testimonials.find(t => t.id === isEditing);
        if (testimonialToEdit) {
          await updateTestimonial(isEditing, { 
            ...formData, 
            authorRole: formData.authorRole || null,
            avatarUrl: formData.avatarUrl || null,
            score: formData.score || null,
            order: testimonialToEdit.order 
          });
          setTestimonials(prev => prev.map(t => t.id === isEditing ? { 
            ...t, 
            ...formData,
            authorRole: formData.authorRole || null,
            avatarUrl: formData.avatarUrl || null,
            score: formData.score || null
          } : t));
          setIsEditing(null);
          toast.success("Testimonial updated successfully.");
          router.refresh();
        }
      } catch (err) {
        toast.error("Failed to update testimonial.");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this testimonial?")) {
      try {
        await deleteTestimonial(id);
        setTestimonials(prev => prev.filter(t => t.id !== id));
        toast.success("Testimonial deleted successfully.");
        router.refresh();
      } catch (err) {
        toast.error("Failed to delete testimonial.");
      }
    }
  };

  const resetForm = () => {
    setFormData({ 
      authorName: "", authorRole: "", content: "", avatarUrl: "", 
      rating: 5, published: true, score: "", isHallOfFame: false, isFeatured: false 
    });
  }

  const startEdit = (t: Testimonial) => {
    setIsEditing(t.id);
    setIsCreating(false);
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
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setIsCreating(false);
  };

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
          onClick={() => {
            setIsCreating(true);
            resetForm();
          }}
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
                    <TableCell>
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
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <DialogTitle className="text-slate-900 dark:text-slate-100">{isCreating ? "Add Testimonial" : "Edit Testimonial"}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Author Name</label>
                  <Input 
                    value={formData.authorName} 
                    onChange={e => setFormData({...formData, authorName: e.target.value})} 
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Author Role <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <Input 
                    value={formData.authorRole} 
                    onChange={e => setFormData({...formData, authorRole: e.target.value})} 
                    placeholder="e.g. IELTS Student"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Content</label>
                <Textarea 
                  value={formData.content} 
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Avatar URL <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <Input 
                    value={formData.avatarUrl} 
                    onChange={e => setFormData({...formData, avatarUrl: e.target.value})} 
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">High Score <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <Input 
                    value={formData.score} 
                    onChange={e => setFormData({...formData, score: e.target.value})} 
                    placeholder="e.g. IELTS 8.0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="isHallOfFame" 
                    checked={formData.isHallOfFame} 
                    onChange={e => setFormData({...formData, isHallOfFame: e.target.checked})}
                    className="rounded border-slate-300 w-4 h-4"
                  />
                  <div className="flex flex-col">
                    <label htmlFor="isHallOfFame" className="text-sm font-medium">Hall of Fame</label>
                    <span className="text-xs text-slate-500">Add to Hall of Fame section</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="isFeatured" 
                    checked={formData.isFeatured} 
                    onChange={e => setFormData({...formData, isFeatured: e.target.checked})}
                    className="rounded border-slate-300 w-4 h-4"
                  />
                  <div className="flex flex-col">
                    <label htmlFor="isFeatured" className="text-sm font-medium">Featured</label>
                    <span className="text-xs text-slate-500">Pin to the front page</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="published" 
                    checked={formData.published} 
                    onChange={e => setFormData({...formData, published: e.target.checked})}
                    className="rounded border-slate-300 w-4 h-4"
                  />
                  <label htmlFor="published" className="text-sm font-medium">Published</label>
              </div>
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <Button variant="ghost" onClick={cancelEdit}>Cancel</Button>
            <Button className="bg-orange hover:bg-orange-hover text-white" onClick={isCreating ? handleCreate : handleUpdate}>
              {isCreating ? "Add Testimonial" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
