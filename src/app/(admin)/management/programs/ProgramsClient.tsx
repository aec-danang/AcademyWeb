"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProgram, updateProgram, deleteProgram } from "./actions";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { IconSelector } from "@/components/ui/icon-selector";

type Program = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  iconType: string;
  iconValue: string;
  order: number;
  published: boolean;
};

export default function ProgramsClient({ initialPrograms }: { initialPrograms: Program[] }) {
  const router = useRouter();
  const [programs, setPrograms] = useState([...initialPrograms]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    content: "",
    iconType: "lucide",
    iconValue: "",
    published: true,
  });
  const [isCreating, setIsCreating] = useState(false);

  const filteredPrograms = programs.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
    try {
      const newOrder = programs.length > 0 ? Math.max(...programs.map(p => p.order)) + 1 : 1;
      await createProgram({ ...formData, order: newOrder });
      setIsCreating(false);
      toast.success("Program created successfully.");
      router.refresh();
      // Temporary optimistic update until refresh completes
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      toast.error("Failed to create program.");
    }
  };

  const handleUpdate = async () => {
    if (isEditing) {
      try {
        const programToEdit = programs.find(p => p.id === isEditing);
        if (programToEdit) {
          await updateProgram(isEditing, { ...formData, order: programToEdit.order });
          setIsEditing(null);
          toast.success("Program updated successfully.");
          router.refresh();
          setTimeout(() => window.location.reload(), 500);
        }
      } catch (err) {
        toast.error("Failed to update program.");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this program?")) {
      try {
        await deleteProgram(id);
        setPrograms(prev => prev.filter(p => p.id !== id));
        toast.success("Program deleted successfully.");
        router.refresh();
      } catch (err) {
        toast.error("Failed to delete program.");
      }
    }
  };

  const startEdit = (program: Program) => {
    setIsEditing(program.id);
    setIsCreating(false);
    setFormData({
      title: program.title,
      slug: program.slug,
      description: program.description || "",
      content: program.content || "",
      iconType: program.iconType,
      iconValue: program.iconValue,
      published: program.published,
    });
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setIsCreating(false);
  };

  return (
    <div className="space-y-6 relative pb-20">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Manage Programs</h2>
        <p className="text-slate-500 dark:text-slate-400">Add, edit, or remove programs shown on the public website.</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Search programs by title..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 w-full h-10 shadow-sm"
            />
          </div>
        </div>
        <Button 
          className="bg-orange hover:bg-orange-hover text-white h-10 shadow-sm w-full sm:w-auto transition-colors" 
          onClick={() => {
            setIsCreating(true);
            setFormData({ title: "", slug: "", description: "", content: "", iconType: "lucide", iconValue: "", published: true });
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Program
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80 dark:bg-slate-800/40 backdrop-blur-sm">
            <TableRow className="border-slate-200 dark:border-slate-800">
              <TableHead className="w-[180px] text-xs font-semibold tracking-wider text-slate-500 uppercase py-4">Title</TableHead>
              <TableHead className="w-[120px] text-xs font-semibold tracking-wider text-slate-500 uppercase py-4">Slug</TableHead>
              <TableHead className="text-xs font-semibold tracking-wider text-slate-500 uppercase py-4">Description</TableHead>
              <TableHead className="w-[120px] text-xs font-semibold tracking-wider text-slate-500 uppercase py-4">Icon</TableHead>
              <TableHead className="w-[120px] text-right text-xs font-semibold tracking-wider text-slate-500 uppercase py-4 px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPrograms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center text-slate-500">
                  <p>No programs found.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredPrograms.map((item) => (
                <TableRow key={item.id} className="group border-slate-200 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <TableCell className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</TableCell>
                  <TableCell className="text-slate-500">{item.slug}</TableCell>
                  <TableCell className="text-slate-500 truncate max-w-[200px]">{item.description}</TableCell>
                  <TableCell className="text-slate-500 text-sm">{item.iconType === 'lucide' ? item.iconValue : 'Image'}</TableCell>
                  <TableCell className="text-right px-6">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900" onClick={() => startEdit(item)}>
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

      <Dialog open={isCreating || isEditing !== null} onOpenChange={(open) => !open && cancelEdit()}>
        <DialogContent className="sm:max-w-[700px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">{isCreating ? "Add New Program" : "Edit Program"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
                <Input placeholder="English for Kids" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Slug</label>
                <Input placeholder="kids" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
              </div>
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description (Short excerpt)</label>
              <Input placeholder="Interactive learning for young minds..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Icon Type</label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
                  value={formData.iconType}
                  onChange={(e) => setFormData({...formData, iconType: e.target.value})}
                >
                  <option value="lucide">Lucide Icon</option>
                  <option value="image">Image URL</option>
                </select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{formData.iconType === 'lucide' ? 'Icon' : 'Image URL'}</label>
                {formData.iconType === 'lucide' ? (
                  <IconSelector 
                    value={formData.iconValue} 
                    onValueChange={value => setFormData({...formData, iconValue: value})} 
                  />
                ) : (
                  <Input placeholder="/logos/addc.png" value={formData.iconValue} onChange={e => setFormData({...formData, iconValue: e.target.value})} />
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Page Content (HTML)</label>
              <RichTextEditor
                content={formData.content}
                onChange={content => setFormData({...formData, content})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={cancelEdit}>Cancel</Button>
            <Button className="bg-orange hover:bg-orange-hover text-white" onClick={isCreating ? handleCreate : handleUpdate}>
              {isCreating ? "Add Program" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
