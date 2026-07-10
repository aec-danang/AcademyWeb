"use client";

import { useState, useMemo } from "react";
import { Plus, Upload, Trash2, Search, Loader2, Edit2, Shield, GraduationCap, User, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { deleteAccount, saveAccounts } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

type AccountRole = "USER" | "TEACHER" | "ADMIN" | "STUDENT";

type AccountRow = {
  id?: string;
  name: string;
  username: string;
  email: string;
  role: AccountRole;
  password?: string;
  createdAt: string;
  updatedAt: string;
};

const roleLabels: Record<AccountRole, string> = {
  USER: "User",
  STUDENT: "Student",
  TEACHER: "Teacher",
  ADMIN: "Admin",
};

function normalizeRole(value: string): AccountRole {
  const normalizedValue = value.trim().toUpperCase();
  if (normalizedValue === "TEACHER") return "TEACHER";
  if (normalizedValue === "ADMIN") return "ADMIN";
  if (normalizedValue === "STUDENT") return "STUDENT";
  return "USER";
}

function parseBulkImport(text: string): AccountRow[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name = "", username = "", email = "", role = "USER", password = ""] = line.split(/[;,\t]/).map((segment) => segment.trim());
      return {
        name,
        username,
        email,
        role: normalizeRole(role),
        password,
        createdAt: "",
        updatedAt: "",
      };
    })
    .filter((row) => row.email.length > 0 || row.username.length > 0);
}

export default function AccountManagerClient({ initialUsers }: { initialUsers: AccountRow[] }) {
  const [rows, setRows] = useState(initialUsers);
  const [bulkText, setBulkText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountRow | null>(null);
  
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Pagination & Sorting State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState<keyof AccountRow | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

  const [newAccount, setNewAccount] = useState<AccountRow>({
    name: "",
    username: "",
    email: "",
    role: "USER",
    password: "",
    createdAt: "",
    updatedAt: "",
  });

  const handleAddAccount = async () => {
    if (!newAccount.username && !newAccount.email) {
      toast.error("Username or Email is required.");
      return;
    }
    
    setIsSaving(true);
    try {
      await saveAccounts([newAccount]);
      setRows((currentRows) => [...currentRows, { ...newAccount, createdAt: new Date().toISOString() }]);
      setIsAddModalOpen(false);
      setNewAccount({
        name: "",
        username: "",
        email: "",
        role: "USER",
        password: "",
        createdAt: "",
        updatedAt: "",
      });
      toast.success("Account added successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save account.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImportRows = async () => {
    const importedRows = parseBulkImport(bulkText);
    if (importedRows.length === 0) {
      toast.error("Paste at least one line in the format: name,username,email,role,password");
      return;
    }
    
    setIsSaving(true);
    try {
      await saveAccounts(importedRows);
      setRows((currentRows) => [...currentRows, ...importedRows.map(r => ({ ...r, createdAt: new Date().toISOString() }))]);
      setBulkText("");
      setIsImportModalOpen(false);
      toast.success(`${importedRows.length} accounts imported successfully.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to import accounts.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditSave = async () => {
    if (!editingAccount) return;
    if (!editingAccount.username && !editingAccount.email) {
      toast.error("Username or Email is required.");
      return;
    }
    
    setIsSaving(true);
    try {
      await saveAccounts([editingAccount]);
      setRows((currentRows) => currentRows.map((r) => r.id === editingAccount.id ? editingAccount : r));
      setIsEditModalOpen(false);
      setEditingAccount(null);
      toast.success("Account updated successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save account.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (rowToUpdate: AccountRow) => {
    if (!rowToUpdate.id) {
      setRows((currentRows) => currentRows.filter((r) => r !== rowToUpdate));
      toast.success("Unsaved row removed.");
      return;
    }

    if (!window.confirm(`Delete ${rowToUpdate.username || rowToUpdate.email}?`)) {
      return;
    }

    setIsSaving(true);
    try {
      await deleteAccount(rowToUpdate.id);
      setRows((currentRows) => currentRows.filter((r) => r !== rowToUpdate));
      toast.success("Account deleted successfully.");
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : "Unable to delete this account.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSort = (column: keyof AccountRow) => {
    if (sortColumn === column) {
      if (sortDirection === "asc") setSortDirection("desc");
      else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (roleFilter !== "ALL" && row.role !== roleFilter) return false;
      if (search) {
        const term = search.toLowerCase();
        return (
          row.name.toLowerCase().includes(term) ||
          row.username.toLowerCase().includes(term) ||
          row.email.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [rows, roleFilter, search]);

  const sortedRows = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const aVal = a[sortColumn] || "";
      const bVal = b[sortColumn] || "";
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredRows, sortColumn, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  
  // Ensure current page is valid when filtering reduces row count
  if (currentPage > totalPages) {
    setCurrentPage(totalPages);
  }

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  const SortIcon = ({ column }: { column: keyof AccountRow }) => {
    if (sortColumn !== column) return <ArrowUpDown className="ml-2 h-4 w-4 text-slate-400" />;
    if (sortDirection === "asc") return <ArrowUp className="ml-2 h-4 w-4 text-orange" />;
    return <ArrowDown className="ml-2 h-4 w-4 text-orange" />;
  };

  return (
    <div className="space-y-6 relative pb-20">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Account Manager</h2>
          {isSaving && <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />}
        </div>
        <p className="text-slate-500 dark:text-slate-400">View, create, and manage all student and teacher accounts.</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by name, username, email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="pl-9 bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 w-full h-10 shadow-sm focus-visible:ring-1 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-600 transition-shadow"
            />
          </div>
          <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[140px] h-10 bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 shadow-sm">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="STUDENT">Student</SelectItem>
              <SelectItem value="TEACHER">Teacher</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <Button variant="outline" className="h-10 shadow-sm bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800" onClick={() => setIsImportModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Bulk Import
          </Button>
          <Button className="bg-orange hover:bg-orange-hover text-white h-10 shadow-sm transition-colors" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80 dark:bg-slate-800/40 backdrop-blur-sm">
            <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
              <TableHead className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4" onClick={() => handleSort("name")}>
                <div className="flex items-center">Name <SortIcon column="name" /></div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4" onClick={() => handleSort("username")}>
                <div className="flex items-center">Username <SortIcon column="username" /></div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4" onClick={() => handleSort("email")}>
                <div className="flex items-center">Email <SortIcon column="email" /></div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4" onClick={() => handleSort("role")}>
                <div className="flex items-center">Role <SortIcon column="role" /></div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4" onClick={() => handleSort("createdAt")}>
                <div className="flex items-center">Created <SortIcon column="createdAt" /></div>
              </TableHead>
              <TableHead className="text-right text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4 px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No accounts found matching your criteria.
                </TableCell>
              </TableRow>
            )}
            {paginatedRows.map((row, index) => (
              <TableRow key={row.id || `${row.username || row.email || "new"}-${index}`} className="group border-slate-200 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                <TableCell className="font-semibold text-slate-900 dark:text-slate-100 py-4">
                  {row.name || <span className="text-slate-400 italic font-normal">No name</span>}
                </TableCell>
                <TableCell className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {row.username || "-"}
                </TableCell>
                <TableCell className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {row.email || "-"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    row.role === "ADMIN" ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 font-medium px-2.5 py-0.5 shadow-sm" :
                    row.role === "TEACHER" ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 font-medium px-2.5 py-0.5 shadow-sm" :
                    "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/20 font-medium px-2.5 py-0.5 shadow-sm"
                  }>
                    {row.role === "ADMIN" && <Shield className="mr-1.5 h-3 w-3" />}
                    {row.role === "TEACHER" && <GraduationCap className="mr-1.5 h-3 w-3" />}
                    {row.role === "USER" && <User className="mr-1.5 h-3 w-3" />}
                    {roleLabels[row.role]}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-500 dark:text-slate-400 text-sm font-medium whitespace-nowrap">
                  {row.createdAt ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(row.createdAt)) : "New row"}
                </TableCell>
                <TableCell className="text-right px-6">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-100" onClick={() => { setEditingAccount({...row, password: ""}); setIsEditModalOpen(true); }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:text-slate-500 dark:hover:text-red-400 dark:hover:bg-red-950/30" onClick={() => handleDelete(row)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div>
          Showing {((currentPage - 1) * pageSize) + (paginatedRows.length > 0 ? 1 : 0)} to {((currentPage - 1) * pageSize) + paginatedRows.length} of {sortedRows.length} accounts
        </div>
        
        {totalPages > 1 && (
          <Pagination className="justify-end w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                if (
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink 
                        isActive={currentPage === page}
                        onClick={() => setCurrentPage(page)}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                
                if (page === 2 && currentPage > 3) {
                  return <PaginationItem key="ellipsis-start"><PaginationEllipsis /></PaginationItem>;
                }
                
                if (page === totalPages - 1 && currentPage < totalPages - 2) {
                  return <PaginationItem key="ellipsis-end"><PaginationEllipsis /></PaginationItem>;
                }
                
                return null;
              })}

              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      {/* Edit Account Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={(open) => { setIsEditModalOpen(open); if (!open) setEditingAccount(null); }}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
            <DialogDescription>Modify the details for this account and click save.</DialogDescription>
          </DialogHeader>
          {editingAccount && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input className="bg-slate-50 dark:bg-slate-900" value={editingAccount.name} onChange={(e) => setEditingAccount({...editingAccount, name: e.target.value})} placeholder="e.g. John Doe" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Username</label>
                <Input className="bg-slate-50 dark:bg-slate-900" value={editingAccount.username} onChange={(e) => setEditingAccount({...editingAccount, username: e.target.value})} placeholder="e.g. johndoe" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Email</label>
                <Input className="bg-slate-50 dark:bg-slate-900" type="email" value={editingAccount.email} onChange={(e) => setEditingAccount({...editingAccount, email: e.target.value})} placeholder="name@example.com" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={editingAccount.role} onValueChange={(val: AccountRole) => setEditingAccount({...editingAccount, role: val})}>
                  <SelectTrigger className="bg-slate-50 dark:bg-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="STUDENT">Student</SelectItem>
                    <SelectItem value="TEACHER">Teacher</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">New Password</label>
                <Input className="bg-slate-50 dark:bg-slate-900" type="password" value={editingAccount.password || ""} onChange={(e) => setEditingAccount({...editingAccount, password: e.target.value})} placeholder="Leave blank to keep current password" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditModalOpen(false); setEditingAccount(null); }}>Cancel</Button>
            <Button className="bg-orange hover:bg-orange-hover text-white" onClick={handleEditSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Account Dialog */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Add New Account</DialogTitle>
            <DialogDescription>Create a new account manually.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input className="bg-slate-50 dark:bg-slate-900" value={newAccount.name} onChange={(e) => setNewAccount({...newAccount, name: e.target.value})} placeholder="e.g. John Doe" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Username</label>
              <Input className="bg-slate-50 dark:bg-slate-900" value={newAccount.username} onChange={(e) => setNewAccount({...newAccount, username: e.target.value})} placeholder="e.g. johndoe" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Email</label>
              <Input className="bg-slate-50 dark:bg-slate-900" type="email" value={newAccount.email} onChange={(e) => setNewAccount({...newAccount, email: e.target.value})} placeholder="name@example.com" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={newAccount.role} onValueChange={(val: AccountRole) => setNewAccount({...newAccount, role: val})}>
                <SelectTrigger className="bg-slate-50 dark:bg-slate-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Password</label>
              <Input className="bg-slate-50 dark:bg-slate-900" type="password" value={newAccount.password} onChange={(e) => setNewAccount({...newAccount, password: e.target.value})} placeholder="Optional password" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button className="bg-orange hover:bg-orange-hover text-white" onClick={handleAddAccount} disabled={isSaving}>
              {isSaving ? "Adding..." : "Add Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Dialog */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Import Accounts</DialogTitle>
            <DialogDescription>
              Paste one account per line using comma, semicolon, or tab separators.
              <br/>
              Format: <strong>name,username,email,role,password</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              rows={8}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="Nguyen Van A,nva123,nva@example.com,student,Temp1234&#10;Tran Thi B,ttb123,ttb@example.com,teacher,Temp1234"
              className="font-mono text-sm bg-slate-50 dark:bg-slate-900"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportModalOpen(false)}>Cancel</Button>
            <Button className="bg-orange hover:bg-orange-hover text-white" onClick={handleImportRows} disabled={isSaving}>
              <Upload className="mr-2 h-4 w-4" />
              {isSaving ? "Importing..." : "Import Rows"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}