"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSponsor, updateSponsor, deleteSponsor, reorderSponsors } from "./actions";
import { Plus, Edit2, Trash2, GripVertical, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

type Sponsor = {
  id: string;
  name: string;
  imageUrl: string;
  website: string | null;
  order: number;
  published: boolean;
};

export default function SponsorsClient({ initialSponsors }: { initialSponsors: Sponsor[] }) {
  const router = useRouter();
  // Sort sponsors by order initially
  const [sponsors, setSponsors] = useState([...initialSponsors].sort((a, b) => a.order - b.order));
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", imageUrl: "", website: "" });
  const [isCreating, setIsCreating] = useState(false);

  // Drag and Drop States
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const filteredSponsors = sponsors.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
    try {
      const newOrder = sponsors.length > 0 ? Math.max(...sponsors.map(s => s.order)) + 1 : 1;
      await createSponsor({ ...formData, website: formData.website || null, order: newOrder, published: true });
      setIsCreating(false);
      setFormData({ name: "", imageUrl: "", website: "" });
      toast.success("Sponsor created successfully.");
      router.refresh();
      // Wait for router refresh to bring new data, then update local state if needed
      // Actually, since this is a client component initialized with a prop, 
      // we need to rely on the parent re-rendering it with new props after router.refresh()
      // To immediately show it, we could optimistically add it with a fake ID, but router.refresh is fast enough.
    } catch (err) {
      toast.error("Failed to create sponsor.");
    }
  };

  const handleUpdate = async () => {
    if (isEditing) {
      try {
        const sponsorToEdit = sponsors.find(s => s.id === isEditing);
        if (sponsorToEdit) {
          await updateSponsor(isEditing, { ...formData, website: formData.website || null, order: sponsorToEdit.order, published: sponsorToEdit.published });
          // Optimistic local update
          setSponsors(prev => prev.map(s => s.id === isEditing ? { ...s, name: formData.name, imageUrl: formData.imageUrl, website: formData.website || null } : s));
          setIsEditing(null);
          toast.success("Sponsor updated successfully.");
          router.refresh();
        }
      } catch (err) {
        toast.error("Failed to update sponsor.");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this sponsor?")) {
      try {
        await deleteSponsor(id);
        // Optimistic local update
        setSponsors(prev => prev.filter(s => s.id !== id));
        toast.success("Sponsor deleted successfully.");
        router.refresh();
      } catch (err) {
        toast.error("Failed to delete sponsor.");
      }
    }
  };

  const startEdit = (sponsor: Sponsor) => {
    setIsEditing(sponsor.id);
    setIsCreating(false);
    setFormData({
      name: sponsor.name,
      imageUrl: sponsor.imageUrl,
      website: sponsor.website || "",
    });
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setIsCreating(false);
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnter = (index: number) => {
    setDragOverIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      // Create new sorted array
      const newSponsors = [...sponsors];
      const draggedItem = newSponsors[draggedIndex];
      newSponsors.splice(draggedIndex, 1);
      newSponsors.splice(dragOverIndex, 0, draggedItem);
      
      // Update local state immediately
      setSponsors(newSponsors);
      
      // Compute updates for the backend
      try {
        const updates = newSponsors.map((s, idx) => ({ id: s.id, order: idx + 1 }));
        await reorderSponsors(updates);
        toast.success("Sponsors reordered successfully.");
      } catch (err) {
        toast.error("Failed to save new order.");
      }
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-6 relative pb-20">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Manage Sponsors</h2>
        <p className="text-slate-500 dark:text-slate-400">Manage partner logos and website links displayed on the main page.</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Search sponsors by name..." 
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
            setFormData({ name: "", imageUrl: "", website: "" });
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Sponsor
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80 dark:bg-slate-800/40 backdrop-blur-sm">
            <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
              <TableHead className="w-[60px] text-center px-4"></TableHead>
              <TableHead className="w-[120px] text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4">Logo</TableHead>
              <TableHead className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4">Sponsor Name</TableHead>
              <TableHead className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4">Website</TableHead>
              <TableHead className="w-[120px] text-right text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4 px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSponsors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center text-slate-500 dark:text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Search className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                    <p>No sponsors found matching your search.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredSponsors.map((item) => {
                const isSearching = searchQuery.length > 0;
                const globalIndex = sponsors.findIndex(s => s.id === item.id);
                
                return (
                  <TableRow 
                    key={item.id} 
                    draggable={!isSearching}
                    onDragStart={() => !isSearching && handleDragStart(globalIndex)}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      if (!isSearching) handleDragEnter(globalIndex);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnd={handleDragEnd}
                    className={`
                      group border-slate-200 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors
                      ${!isSearching ? "cursor-grab active:cursor-grabbing" : ""}
                      ${draggedIndex === globalIndex ? "opacity-50 bg-slate-50 dark:bg-slate-800/50" : ""}
                      ${dragOverIndex === globalIndex && draggedIndex !== globalIndex ? (
                        draggedIndex! < dragOverIndex ? "border-b-2 border-b-orange dark:border-b-orange" : "border-t-2 border-t-orange dark:border-t-orange"
                      ) : ""}
                    `}
                  >
                    <TableCell className="px-4 text-center">
                      <GripVertical className={`h-5 w-5 mx-auto text-slate-300 dark:text-slate-600 ${isSearching ? 'opacity-30 cursor-not-allowed' : 'group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors'}`} />
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="w-[80px] h-[40px] flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-md p-1.5 shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {item.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      {item.website ? (
                        <a href={item.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors truncate max-w-[250px] block">
                          {item.website}
                        </a>
                      ) : (
                        <span className="text-sm text-slate-400 dark:text-slate-500 font-medium">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-100" onClick={() => startEdit(item)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:text-slate-500 dark:hover:text-red-400 dark:hover:bg-red-950/30" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isCreating || isEditing !== null} onOpenChange={(open) => !open && cancelEdit()}>
        <DialogContent className="sm:max-w-[550px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">{isCreating ? "Add New Sponsor" : "Edit Sponsor"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4 md:grid-cols-[120px_1fr]">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Logo Preview</label>
              <div className="w-full h-[80px] rounded-lg border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 overflow-hidden shadow-inner">
                {formData.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img 
                    src={formData.imageUrl} 
                    alt="Preview" 
                    className="w-full h-full object-contain p-2" 
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
                  />
                ) : (
                  <span className="text-xs text-slate-400">No Image</span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sponsor Name</label>
                <Input 
                  placeholder="e.g. FPT Software" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Logo URL</label>
                <Input 
                  placeholder="https://example.com/logo.png" 
                  value={formData.imageUrl} 
                  onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium flex items-center justify-between text-slate-700 dark:text-slate-300">
                  Website URL
                  <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                </label>
                <Input 
                  placeholder="https://example.com" 
                  value={formData.website} 
                  onChange={e => setFormData({...formData, website: e.target.value})} 
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={cancelEdit} className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">Cancel</Button>
            <Button className="bg-orange hover:bg-orange-hover text-white shadow-sm" onClick={isCreating ? handleCreate : handleUpdate}>
              {isCreating ? "Add Sponsor" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
