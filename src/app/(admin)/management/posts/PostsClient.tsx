"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deletePost, batchDeletePosts, batchUpdatePosts } from "./actions";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

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

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
    setSelectedSlugs([]);
  };

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleDelete = async (slug: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      await deletePost(slug);
      window.location.reload();
    }
  };

  const toggleSelection = (slug: string) => {
    setSelectedSlugs(prev => 
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  const isAllSelected = paginatedPosts.length > 0 && paginatedPosts.every(p => selectedSlugs.includes(p.slug));

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      const pageSlugs = paginatedPosts.map(p => p.slug);
      setSelectedSlugs(prev => prev.filter(s => !pageSlugs.includes(s)));
    } else {
      const pageSlugs = paginatedPosts.map(p => p.slug);
      setSelectedSlugs(prev => Array.from(new Set([...prev, ...pageSlugs])));
    }
  };

  const handleBatchDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedSlugs.length} posts?`)) {
      await batchDeletePosts(selectedSlugs);
      window.location.reload();
    }
  };

  const handleBatchStatus = async (published: boolean) => {
    await batchUpdatePosts(selectedSlugs, { published });
    window.location.reload();
  };

  const handleBatchType = async (type: string) => {
    await batchUpdatePosts(selectedSlugs, { type });
    window.location.reload();
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);
      
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight text-navy dark:text-white">Manage Posts</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search posts..." 
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-9 w-[250px] bg-white dark:bg-slate-900"
            />
          </div>
          <Button className="bg-orange hover:bg-orange-hover text-white" onClick={() => router.push("/management/posts/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Button>
        </div>
      </div>

      {selectedSlugs.length > 0 && (
        <div className="flex items-center justify-between p-3 px-4 bg-orange/10 border border-orange/20 rounded-md">
          <div className="text-sm font-medium text-orange">
            {selectedSlugs.length} item{selectedSlugs.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleBatchDelete} className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive">
              Delete
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBatchStatus(true)}>
              Publish
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBatchStatus(false)}>
              Unpublish
            </Button>
            <Select onValueChange={handleBatchType}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Change Type..." />
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
        </div>
      )}

      <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
            <TableRow>
              <TableHead className="w-[40px] text-center">
                <Checkbox 
                  checked={isAllSelected && paginatedPosts.length > 0} 
                  onCheckedChange={handleSelectAllToggle} 
                  aria-label="Select all on page"
                />
              </TableHead>
              <TableHead>Title & Slug</TableHead>
              <TableHead className="w-[120px] text-center">Type</TableHead>
              <TableHead className="w-[120px] text-center">Date</TableHead>
              <TableHead className="w-[100px] text-center">Status</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No posts found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedPosts.map((item) => (
                <TableRow key={item.slug}>
                  <TableCell className="text-center">
                    <Checkbox 
                      checked={selectedSlugs.includes(item.slug)} 
                      onCheckedChange={() => toggleSelection(item.slug)} 
                      aria-label={`Select ${item.title}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-navy dark:text-slate-200">{item.title}</span>
                      <span className="text-xs text-muted-foreground">{item.slug}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center capitalize font-medium text-sm">
                    {item.type}
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={item.published ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800" : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800"}>
                      {item.published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => router.push(`/management/posts/${item.slug}/edit`)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(item.slug)}>
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredPosts.length)} of {filteredPosts.length} entries
          </div>
          <Pagination className="w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {getPageNumbers().map(num => (
                <PaginationItem key={num}>
                  <PaginationLink 
                    isActive={currentPage === num}
                    onClick={() => setCurrentPage(num)}
                    className="cursor-pointer"
                  >
                    {num}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
