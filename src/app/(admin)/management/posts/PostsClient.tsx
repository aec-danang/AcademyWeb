"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deletePost, batchDeletePosts, batchUpdatePosts } from "./actions";
import { Plus, Edit2, Trash2, Search, MoreHorizontal, FileText, Newspaper, Calendar, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type Post = {
  title: string;
  content: string;
  slug: string;
  type: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  authorId: string | null;
  excerpt: string | null;
  featuredImage: string | null;
  metaDescription: string | null;
  metaTitle: string | null;
};

export default function PostsClient({ initialPosts }: { initialPosts: Post[] }) {
  const router = useRouter();
  const [posts, setPosts] = useState([...initialPosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [lastSelectedSlug, setLastSelectedSlug] = useState<string | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
    setSelectedSlugs([]);
    setLastSelectedSlug(null);
  };

  const filteredPosts = posts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === "published") matchesStatus = p.published === true;
    if (statusFilter === "draft") matchesStatus = p.published === false;

    let matchesType = true;
    if (typeFilter !== "all") matchesType = p.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleDelete = async (slug: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost(slug);
        setPosts(prev => prev.filter(p => p.slug !== slug));
        setSelectedSlugs(prev => prev.filter(s => s !== slug));
        toast.success("Post deleted successfully.");
      } catch (err) {
        toast.error("Failed to delete post.");
      }
    }
  };

  const toggleSelection = (e: React.MouseEvent<HTMLButtonElement>, slug: string) => {
    if (e.shiftKey && lastSelectedSlug) {
      const paginatedSlugs = paginatedPosts.map(p => p.slug);
      const startIdx = paginatedSlugs.indexOf(lastSelectedSlug);
      const endIdx = paginatedSlugs.indexOf(slug);

      if (startIdx !== -1 && endIdx !== -1) {
        const minIdx = Math.min(startIdx, endIdx);
        const maxIdx = Math.max(startIdx, endIdx);
        const rangeSlugs = paginatedSlugs.slice(minIdx, maxIdx + 1);
        
        setSelectedSlugs(prev => {
          const newSet = new Set(prev);
          rangeSlugs.forEach(s => newSet.add(s));
          return Array.from(newSet);
        });
      }
    } else {
      setSelectedSlugs(prev => 
        prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
      );
    }
    setLastSelectedSlug(slug);
  };

  const isAllSelected = paginatedPosts.length > 0 && paginatedPosts.every(p => selectedSlugs.includes(p.slug));

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      const pageSlugs = paginatedPosts.map(p => p.slug);
      setSelectedSlugs(prev => prev.filter(s => !pageSlugs.includes(s)));
      setLastSelectedSlug(null);
    } else {
      const pageSlugs = paginatedPosts.map(p => p.slug);
      setSelectedSlugs(prev => Array.from(new Set([...prev, ...pageSlugs])));
    }
  };

  const handleBatchDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedSlugs.length} posts?`)) {
      try {
        await batchDeletePosts(selectedSlugs);
        setPosts(prev => prev.filter(p => !selectedSlugs.includes(p.slug)));
        setSelectedSlugs([]);
        setLastSelectedSlug(null);
        toast.success(`${selectedSlugs.length} posts deleted successfully.`);
      } catch (err) {
        toast.error("Failed to delete posts.");
      }
    }
  };

  const handleBatchStatus = async (published: boolean) => {
    try {
      await batchUpdatePosts(selectedSlugs, { published });
      setPosts(prev => prev.map(p => selectedSlugs.includes(p.slug) ? { ...p, published } : p));
      setSelectedSlugs([]);
      setLastSelectedSlug(null);
      toast.success(`Posts ${published ? 'published' : 'unpublished'} successfully.`);
    } catch (err) {
      toast.error("Failed to update post status.");
    }
  };

  const handleBatchType = async (type: string) => {
    try {
      await batchUpdatePosts(selectedSlugs, { type });
      setPosts(prev => prev.map(p => selectedSlugs.includes(p.slug) ? { ...p, type } : p));
      setSelectedSlugs([]);
      setLastSelectedSlug(null);
      toast.success(`Post types updated successfully.`);
    } catch (err) {
      toast.error("Failed to update post types.");
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) pages.push(i);
    }
    
    return pages;
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 relative pb-20">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Manage Posts</h2>
        <p className="text-slate-500 dark:text-slate-400">View, create, and manage all your publications.</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Search by title or type..." 
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-9 bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 w-full h-10 shadow-sm focus-visible:ring-1 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-600 transition-shadow"
            />
          </div>
          <Select value={typeFilter} onValueChange={(val) => { setTypeFilter(val); setCurrentPage(1); setSelectedSlugs([]); setLastSelectedSlug(null); }}>
            <SelectTrigger className="w-[120px] h-10 bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 shadow-sm">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="post">Post</SelectItem>
              <SelectItem value="news">News</SelectItem>
              <SelectItem value="event">Event</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); setSelectedSlugs([]); setLastSelectedSlug(null); }}>
            <SelectTrigger className="w-[140px] h-10 bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 shadow-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="bg-orange hover:bg-orange-hover text-white h-10 shadow-sm w-full sm:w-auto transition-colors" onClick={() => router.push("/management/posts/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Post
        </Button>
      </div>

      {selectedSlugs.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 fade-in duration-300">
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full shadow-2xl border border-slate-800 dark:border-slate-200">
            <Badge variant="secondary" className="bg-white/20 dark:bg-black/10 hover:bg-white/20 text-white dark:text-black border-none px-2.5 py-0.5 pointer-events-none">
              {selectedSlugs.length} selected
            </Badge>
            <div className="w-px h-5 bg-slate-700 dark:bg-slate-300 mx-2" />
            <Button size="sm" variant="ghost" onClick={handleBatchDelete} className="h-8 hover:bg-white/10 dark:hover:bg-black/5 text-red-400 dark:text-red-600 hover:text-red-300 dark:hover:text-red-700">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
            <div className="w-px h-5 bg-slate-700 dark:bg-slate-300 mx-2" />
            <Button size="sm" variant="ghost" onClick={() => handleBatchStatus(true)} className="h-8 hover:bg-white/10 dark:hover:bg-black/5">
              Publish
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleBatchStatus(false)} className="h-8 hover:bg-white/10 dark:hover:bg-black/5">
              Unpublish
            </Button>
            <div className="w-px h-5 bg-slate-700 dark:bg-slate-300 mx-2" />
            <Select onValueChange={handleBatchType}>
              <SelectTrigger className="h-8 w-[140px] bg-transparent border-none hover:bg-white/10 dark:hover:bg-black/5 focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Change Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="post">Post</SelectItem>
                <SelectItem value="news">News</SelectItem>
                <SelectItem value="event">Event</SelectItem>
              </SelectContent>
            </Select>
            <div className="w-px h-5 bg-slate-700 dark:bg-slate-300 mx-2" />
            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/10 dark:hover:bg-black/5 rounded-full" onClick={() => setSelectedSlugs([])}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80 dark:bg-slate-800/40 backdrop-blur-sm">
            <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
              <TableHead className="w-[50px] text-center px-4">
                <Checkbox 
                  checked={isAllSelected && paginatedPosts.length > 0} 
                  onCheckedChange={handleSelectAllToggle} 
                  aria-label="Select all on page"
                  className="border-slate-300 dark:border-slate-600 data-[state=checked]:bg-slate-900 dark:data-[state=checked]:bg-slate-100 data-[state=checked]:text-white dark:data-[state=checked]:text-slate-900"
                />
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4">Title & Slug</TableHead>
              <TableHead className="w-[140px] text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4">Type</TableHead>
              <TableHead className="w-[120px] text-center text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4">Date</TableHead>
              <TableHead className="w-[120px] text-center text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4">Status</TableHead>
              <TableHead className="w-[80px] text-right text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4 px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center text-slate-500 dark:text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <FileText className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                    <p>No posts found matching your criteria.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedPosts.map((item) => (
                <TableRow key={item.slug} className="group border-slate-200 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <TableCell className="text-center align-middle px-4">
                    <Checkbox 
                      checked={selectedSlugs.includes(item.slug)} 
                      onClick={(e) => toggleSelection(e, item.slug)} 
                      aria-label={`Select ${item.title}`}
                      className="border-slate-300 dark:border-slate-600 data-[state=checked]:bg-slate-900 dark:data-[state=checked]:bg-slate-100 data-[state=checked]:text-white dark:data-[state=checked]:text-slate-900"
                    />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</span>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate max-w-[400px]">{item.slug}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-none font-medium px-2.5 py-0.5 shadow-none">
                      {item.type === 'news' && <Newspaper className="mr-1.5 h-3 w-3" />}
                      {item.type === 'event' && <Calendar className="mr-1.5 h-3 w-3" />}
                      {item.type === 'post' && <FileText className="mr-1.5 h-3 w-3" />}
                      <span className="capitalize">{item.type}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{formatDate(item.createdAt)}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={item.published 
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 font-medium px-2.5 py-0.5 shadow-sm" 
                      : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 font-medium px-2.5 py-0.5 shadow-sm"}>
                      {item.published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-100 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px] rounded-xl shadow-lg border-slate-200 dark:border-slate-800">
                        <DropdownMenuLabel className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                        <DropdownMenuItem onClick={() => router.push(`/management/posts/${item.slug}/edit`)} className="cursor-pointer font-medium py-2">
                          <Edit2 className="mr-2 h-4 w-4 text-slate-500" />
                          Edit Post
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/30 focus:text-red-600 cursor-pointer font-medium py-2" onClick={() => handleDelete(item.slug)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Post
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredPosts.length)} of {filteredPosts.length} entries
          </div>
          <Pagination className="w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer text-slate-600 dark:text-slate-300 font-medium"}
                />
              </PaginationItem>
              
              {getPageNumbers().map(num => (
                <PaginationItem key={num}>
                  <PaginationLink 
                    isActive={currentPage === num}
                    onClick={() => setCurrentPage(num)}
                    className={currentPage === num ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold" : "cursor-pointer text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"}
                  >
                    {num}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer text-slate-600 dark:text-slate-300 font-medium"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
