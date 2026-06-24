"use client";

import { useState } from "react";
import { createSponsor, updateSponsor, deleteSponsor, reorderSponsors } from "./actions";
import { Plus, Edit2, Trash2, GripVertical, Search } from "lucide-react";
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
    const newOrder = sponsors.length > 0 ? Math.max(...sponsors.map(s => s.order)) + 1 : 1;
    await createSponsor({ ...formData, website: formData.website || null, order: newOrder, published: true });
    window.location.reload();
  };

  const handleUpdate = async () => {
    if (isEditing) {
      const sponsorToEdit = sponsors.find(s => s.id === isEditing);
      if (sponsorToEdit) {
        await updateSponsor(isEditing, { ...formData, website: formData.website || null, order: sponsorToEdit.order, published: sponsorToEdit.published });
        window.location.reload();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this sponsor?")) {
      await deleteSponsor(id);
      window.location.reload();
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
      const updates = newSponsors.map((s, idx) => ({ id: s.id, order: idx + 1 }));
      await reorderSponsors(updates);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight text-navy dark:text-white">Manage Sponsors</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search sponsors..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[250px] bg-white dark:bg-slate-900"
            />
          </div>
          <Button 
            className="bg-orange hover:bg-orange-hover text-white" 
            onClick={() => {
              setIsCreating(true);
              setFormData({ name: "", imageUrl: "", website: "" });
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Sponsor
          </Button>
        </div>
      </div>

      <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead className="w-[120px]">Logo</TableHead>
              <TableHead>Sponsor Name</TableHead>
              <TableHead>Website</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSponsors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No sponsors found matching your search.
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
                      ${!isSearching ? "cursor-grab active:cursor-grabbing" : ""}
                      ${draggedIndex === globalIndex ? "opacity-50 bg-slate-50 dark:bg-slate-800/50" : ""}
                      ${dragOverIndex === globalIndex && draggedIndex !== globalIndex ? (
                        draggedIndex! < dragOverIndex ? "border-b-2 border-b-orange" : "border-t-2 border-t-orange"
                      ) : ""}
                    `}
                  >
                    <TableCell>
                      <GripVertical className={`h-5 w-5 text-slate-400 ${isSearching ? 'opacity-30 cursor-not-allowed' : 'hover:text-slate-600 dark:hover:text-slate-300'}`} />
                    </TableCell>
                    <TableCell>
                      <div className="w-[70px] h-[35px] flex items-center justify-center bg-white border border-slate-100 rounded p-1 dark:bg-slate-800 dark:border-slate-700">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-navy dark:text-slate-200">
                      {item.name}
                    </TableCell>
                    <TableCell>
                      {item.website ? (
                        <a href={item.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          {item.website}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(item)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(item.id)}>
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
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{isCreating ? "Add New Sponsor" : "Edit Sponsor"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4 md:grid-cols-[120px_1fr]">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Logo Preview</label>
              <div className="w-full h-[80px] rounded-lg border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-slate-900 overflow-hidden">
                {formData.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img 
                    src={formData.imageUrl} 
                    alt="Preview" 
                    className="w-full h-full object-contain p-2" 
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">No Image</span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Sponsor Name</label>
                <Input 
                  placeholder="e.g. FPT Software" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Logo URL</label>
                <Input 
                  placeholder="https://example.com/logo.png" 
                  value={formData.imageUrl} 
                  onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium flex items-center justify-between">
                  Website URL
                  <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                </label>
                <Input 
                  placeholder="https://example.com" 
                  value={formData.website} 
                  onChange={e => setFormData({...formData, website: e.target.value})} 
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
            <Button className="bg-orange hover:bg-orange-hover text-white" onClick={isCreating ? handleCreate : handleUpdate}>
              {isCreating ? "Add Sponsor" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
