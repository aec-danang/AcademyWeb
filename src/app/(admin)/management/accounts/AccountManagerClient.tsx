"use client";

import { useState } from "react";
import { Plus, Upload, Trash2, Search, Loader2, Edit, X, MoreHorizontal, User } from "lucide-react";
import { deleteAccount, saveAccounts, batchDeleteAccounts } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

type AccountRole = "USER" | "TEACHER" | "ADMIN" | "STUDENT";

type AccountRow = {
  id?: string;
  name: string;
  username: string;
  email: string;
  role: AccountRole;
  password: string;
  createdAt: string;
  updatedAt: string;
};

const roleLabels: Record<AccountRole, string> = {
  USER: "User",
  TEACHER: "Teacher",
  ADMIN: "Admin",
  STUDENT: "Student",
};

const roleBadgeClass: Record<AccountRole, string> = {
  ADMIN: "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
  TEACHER: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  STUDENT: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  USER: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
};

function normalizeRole(value: string): AccountRole {
  const v = value.trim().toUpperCase();
  if (v === "TEACHER") return "TEACHER";
  if (v === "ADMIN") return "ADMIN";
  if (v === "STUDENT") return "STUDENT";
  return "USER";
}

function parseBulkImport(text: string): AccountRow[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name = "", username = "", email = "", role = "USER", password = ""] = line.split(/[;,\t]/).map((s) => s.trim());
      return { name, username, email, role: normalizeRole(role), password, createdAt: "", updatedAt: "" };
    })
    .filter((row) => row.email.length > 0 || row.username.length > 0);
}

const ITEMS_PER_PAGE = 20;

const EMPTY_ACCOUNT: AccountRow = { name: "", username: "", email: "", role: "USER", password: "", createdAt: "", updatedAt: "" };

export default function AccountManagerClient({ initialUsers }: { initialUsers: AccountRow[] }) {
  const [rows, setRows] = useState(initialUsers.map((u) => ({ ...u, password: "" })));
  const [bulkText, setBulkText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountRow | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const [newAccount, setNewAccount] = useState<AccountRow>(EMPTY_ACCOUNT);

  // Batch selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  // ─── Filtering ────────────────────────────────────────────────────────────────

  const filteredRows = rows.filter((row) => {
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

  const totalPages = Math.ceil(filteredRows.length / ITEMS_PER_PAGE);
  const paginatedRows = filteredRows.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // ─── Row key helper ──────────────────────────────────────────────────────────
  const rowKey = (row: AccountRow, idx: number) => row.id || `${row.username || row.email || "new"}-${idx}`;

  // ─── Selection ────────────────────────────────────────────────────────────────

  const toggleSelection = (e: React.MouseEvent<HTMLButtonElement>, key: string) => {
    if (e.shiftKey && lastSelectedId) {
      const keys = paginatedRows.map((r, i) => rowKey(r, i));
      const startIdx = keys.indexOf(lastSelectedId);
      const endIdx = keys.indexOf(key);
      if (startIdx !== -1 && endIdx !== -1) {
        const range = keys.slice(Math.min(startIdx, endIdx), Math.max(startIdx, endIdx) + 1);
        setSelectedIds((prev) => Array.from(new Set([...prev, ...range])));
      }
    } else {
      setSelectedIds((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
    }
    setLastSelectedId(key);
  };

  const isAllSelected = paginatedRows.length > 0 && paginatedRows.every((r, i) => selectedIds.includes(rowKey(r, i)));

  const handleSelectAllToggle = () => {
    const pageKeys = paginatedRows.map((r, i) => rowKey(r, i));
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((k) => !pageKeys.includes(k)));
      setLastSelectedId(null);
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageKeys])));
    }
  };

  // ─── CRUD ─────────────────────────────────────────────────────────────────────

  const saveRow = async (updated: AccountRow[]) => {
    setIsSaving(true);
    setError(null);
    try {
      await saveAccounts(updated);
      toast.success("Account saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save accounts right now.");
      toast.error("Failed to save account.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAccount = async () => {
    if (!newAccount.username && !newAccount.email) {
      setError("Username or Email is required.");
      return;
    }
    const next = [...rows, { ...newAccount }];
    setRows(next);
    setIsAddModalOpen(false);
    setNewAccount(EMPTY_ACCOUNT);
    setError(null);
    await saveRow(next);
  };

  const handleSaveEdit = async () => {
    if (!editingAccount) return;
    if (!editingAccount.username && !editingAccount.email) {
      setError("Username or Email is required.");
      return;
    }
    const next = rows.map((r) => (r.id === editingAccount.id && r.username === editingAccount.username ? editingAccount : r));
    setRows(next);
    setEditingAccount(null);
    setError(null);
    await saveRow(next);
  };

  const handleImportRows = async () => {
    const imported = parseBulkImport(bulkText);
    if (imported.length === 0) {
      setError("Paste at least one line in the format: name,username,email,role,password");
      return;
    }
    const next = [...rows, ...imported];
    setRows(next);
    setBulkText("");
    setError(null);
    setIsImportModalOpen(false);
    await saveRow(next);
  };

  const handleDelete = async (row: AccountRow) => {
    if (!row.id) {
      setRows((prev) => prev.filter((r) => r !== row));
      return;
    }
    if (!window.confirm(`Delete ${row.username || row.email}?`)) return;
    setIsSaving(true);
    try {
      await deleteAccount(row.id);
      setRows((prev) => prev.filter((r) => r !== row));
      toast.success("Account deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete this account.");
      toast.error("Failed to delete account.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBatchDelete = async () => {
    const idsToDelete = rows
      .filter((r, i) => selectedIds.includes(rowKey(r, i)) && r.id)
      .map((r) => r.id as string);

    const hasUnsaved = selectedIds.length > idsToDelete.length;
    const confirmMsg = hasUnsaved
      ? `Delete ${selectedIds.length} selected accounts (${idsToDelete.length} saved + ${selectedIds.length - idsToDelete.length} unsaved)?`
      : `Delete ${selectedIds.length} selected accounts?`;

    if (!window.confirm(confirmMsg)) return;

    setIsSaving(true);
    try {
      if (idsToDelete.length > 0) await batchDeleteAccounts(idsToDelete);
      setRows((prev) => prev.filter((r, i) => !selectedIds.includes(rowKey(r, i))));
      setSelectedIds([]);
      setLastSelectedId(null);
      toast.success(`${selectedIds.length} accounts deleted.`);
    } catch (err) {
      toast.error("Failed to delete accounts.");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Pagination helpers ───────────────────────────────────────────────────────

  const getPageNumbers = () => {
    const pages: number[] = [];
    const max = 5;
    if (totalPages <= max) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + max - 1);
      if (end - start + 1 < max) start = Math.max(1, end - max + 1);
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Account Manager</h2>
            {isSaving && <Loader2 className="h-5 w-5 text-orange animate-spin" />}
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Manage staff and student accounts, permissions, and passwords.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsImportModalOpen(true)} className="rounded-xl h-11 px-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold transition-all">
            <Upload className="mr-2 h-4 w-4" />
            Bulk Import
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} className="rounded-xl h-11 px-5 bg-orange hover:bg-orange-hover text-white shadow-lg shadow-orange/20 font-semibold transition-all">
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10 p-4 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="mt-0.5 text-red-500">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-red-800 dark:text-red-400">Action needed</h4>
            <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative sm:w-[320px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by name, username, or email..."
            value={search}
            onChange={handleSearchChange}
            className="pl-9 bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 w-full h-10 shadow-sm focus-visible:ring-1 focus-visible:ring-slate-400 transition-shadow"
          />
        </div>
        <Select value={roleFilter} onValueChange={(val) => { setRoleFilter(val); setCurrentPage(1); setSelectedIds([]); }}>
          <SelectTrigger className="w-[140px] h-10 bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 shadow-sm font-medium">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="USER">User</SelectItem>
            <SelectItem value="STUDENT">Student</SelectItem>
            <SelectItem value="TEACHER">Teacher</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Batch action bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 fade-in duration-300">
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full shadow-2xl border border-slate-800 dark:border-slate-200">
            <Badge variant="secondary" className="bg-white/20 dark:bg-black/10 hover:bg-white/20 text-white dark:text-black border-none px-2.5 py-0.5 pointer-events-none">
              {selectedIds.length} selected
            </Badge>
            <div className="w-px h-5 bg-slate-700 dark:bg-slate-300 mx-2" />
            <Button size="sm" variant="ghost" onClick={handleBatchDelete} className="h-8 hover:bg-white/10 dark:hover:bg-black/5 text-red-400 dark:text-red-600 hover:text-red-300 dark:hover:text-red-700">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
            <div className="w-px h-5 bg-slate-700 dark:bg-slate-300 mx-2" />
            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/10 dark:hover:bg-black/5 rounded-full" onClick={() => setSelectedIds([])}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80 dark:bg-slate-800/40 backdrop-blur-sm">
            <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
              <TableHead className="w-[50px] text-center px-4">
                <Checkbox
                  checked={isAllSelected && paginatedRows.length > 0}
                  onCheckedChange={handleSelectAllToggle}
                  aria-label="Select all on page"
                  className="border-slate-300 dark:border-slate-600 data-[state=checked]:bg-slate-900 dark:data-[state=checked]:bg-slate-100 data-[state=checked]:text-white dark:data-[state=checked]:text-slate-900"
                />
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4">Name & Username</TableHead>
              <TableHead className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4">Email</TableHead>
              <TableHead className="w-[130px] text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4">Role</TableHead>
              <TableHead className="w-[110px] text-center text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4">Created</TableHead>
              <TableHead className="w-[80px] text-right text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4 px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center text-slate-500 dark:text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <User className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                    <p>No accounts found matching your criteria.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row, index) => {
                const key = rowKey(row, (currentPage - 1) * ITEMS_PER_PAGE + index);
                const isSelected = selectedIds.includes(key);
                return (
                  <TableRow
                    key={key}
                    className={`group border-slate-200 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer ${isSelected ? "bg-orange/5 dark:bg-orange/5" : ""}`}
                    onDoubleClick={() => setEditingAccount(row)}
                  >
                    <TableCell className="text-center align-middle px-4">
                      <Checkbox
                        checked={isSelected}
                        onClick={(e) => toggleSelection(e, key)}
                        aria-label={`Select ${row.name || row.username}`}
                        className="border-slate-300 dark:border-slate-600 data-[state=checked]:bg-slate-900 dark:data-[state=checked]:bg-slate-100 data-[state=checked]:text-white dark:data-[state=checked]:text-slate-900"
                      />
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {row.name || <span className="text-slate-400 italic font-normal">No name</span>}
                        </span>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {row.username || <span className="italic opacity-50">—</span>}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-slate-600 dark:text-slate-300 text-sm">
                      {row.email || <span className="text-slate-400 italic">—</span>}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant="outline" className={`font-semibold px-2.5 py-0.5 shadow-none text-xs ${roleBadgeClass[row.role]}`}>
                        {roleLabels[row.role] || row.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 text-center text-slate-500 dark:text-slate-400 text-xs font-medium whitespace-nowrap">
                      {row.createdAt
                        ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(row.createdAt))
                        : <span className="italic opacity-50">New</span>}
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-100 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px] rounded-xl shadow-lg border-slate-200 dark:border-slate-800">
                          <DropdownMenuLabel className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                          <DropdownMenuItem onClick={() => setEditingAccount(row)} className="cursor-pointer font-medium py-2">
                            <Edit className="mr-2 h-4 w-4 text-slate-500" />
                            Edit Account
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/30 focus:text-red-600 cursor-pointer font-medium py-2" onClick={() => handleDelete(row)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredRows.length)} of {filteredRows.length} accounts
          </div>
          <Pagination className="w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer text-slate-600 dark:text-slate-300 font-medium"}
                />
              </PaginationItem>
              {getPageNumbers().map((num) => (
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
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer text-slate-600 dark:text-slate-300 font-medium"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Footer count */}
      <div className="text-xs font-medium text-slate-400">
        {filteredRows.length} {filteredRows.length === 1 ? "account" : "accounts"} loaded
      </div>

      {/* ── Add Account Dialog ── */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-[#0b101e]">
          <div className="bg-slate-50/80 dark:bg-slate-900/50 px-6 py-5 border-b border-slate-100 dark:border-slate-800/80">
            <DialogTitle className="text-xl text-slate-900 dark:text-slate-100">Add New Account</DialogTitle>
            <DialogDescription className="mt-1 text-slate-500 dark:text-slate-400">Create a new user, teacher, or admin account.</DialogDescription>
          </div>
          <div className="px-6 py-6 space-y-5">
            {(["Full Name", "Username", "Email", "Password"] as const).map((label) => {
              const field = label === "Full Name" ? "name" : label.toLowerCase() as keyof AccountRow;
              return (
                <div key={label} className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900 dark:text-slate-200">{label}</label>
                  <Input
                    className="h-11 rounded-xl bg-slate-50/50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-orange focus-visible:border-orange dark:text-slate-100 shadow-sm"
                    type={label === "Password" ? "password" : label === "Email" ? "email" : "text"}
                    value={newAccount[field] as string}
                    onChange={(e) => setNewAccount({ ...newAccount, [field]: e.target.value })}
                    placeholder={label === "Full Name" ? "e.g. John Doe" : label === "Username" ? "e.g. johndoe" : label === "Email" ? "name@example.com" : "Optional"}
                  />
                </div>
              );
            })}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-200">Role</label>
              <Select value={newAccount.role} onValueChange={(val: AccountRole) => setNewAccount({ ...newAccount, role: val })}>
                <SelectTrigger className="h-11 rounded-xl bg-slate-50/50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 focus:ring-1 focus:ring-orange dark:text-slate-100 shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="px-6 py-5 bg-slate-50/80 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 flex justify-end gap-3">
            <Button variant="outline" className="rounded-xl font-semibold h-11 px-5 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button className="rounded-xl font-semibold h-11 px-6 bg-orange hover:bg-orange-hover text-white shadow-md shadow-orange/20" onClick={handleAddAccount}>Create Account</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Bulk Import Dialog ── */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-[#0b101e]">
          <div className="bg-slate-50/80 dark:bg-slate-900/50 px-6 py-5 border-b border-slate-100 dark:border-slate-800/80">
            <DialogTitle className="text-xl text-slate-900 dark:text-slate-100">Bulk Import Accounts</DialogTitle>
            <DialogDescription className="mt-1 text-slate-500 dark:text-slate-400">
              Paste one account per line using comma, semicolon, or tab separators.<br />
              Format: <strong className="text-slate-700 dark:text-slate-300">name,username,email,role,password</strong>
            </DialogDescription>
          </div>
          <div className="px-6 py-6">
            <Textarea
              rows={8}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={"Nguyen Van A,nva123,nva@example.com,student,Temp1234\nTran Thi B,ttb123,ttb@example.com,teacher,Temp1234"}
              className="font-mono text-sm rounded-xl resize-none bg-slate-50/50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-orange dark:text-slate-100 shadow-sm"
            />
          </div>
          <div className="px-6 py-5 bg-slate-50/80 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 flex justify-end gap-3">
            <Button variant="outline" className="rounded-xl font-semibold h-11 px-5 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300" onClick={() => setIsImportModalOpen(false)}>Cancel</Button>
            <Button className="rounded-xl font-semibold h-11 px-6 bg-navy dark:bg-white dark:text-navy hover:bg-navy/90 dark:hover:bg-slate-200 text-white shadow-md" onClick={handleImportRows}>
              <Upload className="mr-2 h-4 w-4" />
              Import Rows
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Edit Account Dialog ── */}
      <Dialog open={editingAccount !== null} onOpenChange={(open) => !open && setEditingAccount(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-[#0b101e]">
          <div className="bg-slate-50/80 dark:bg-slate-900/50 px-6 py-5 border-b border-slate-100 dark:border-slate-800/80">
            <DialogTitle className="text-xl text-slate-900 dark:text-slate-100">Edit Account</DialogTitle>
            <DialogDescription className="mt-1 text-slate-500 dark:text-slate-400">
              Update details for {editingAccount?.username || editingAccount?.email}
            </DialogDescription>
          </div>
          {editingAccount && (
            <div className="px-6 py-6 space-y-5">
              {(["Full Name", "Username", "Email"] as const).map((label) => {
                const field = label === "Full Name" ? "name" : label.toLowerCase() as keyof AccountRow;
                return (
                  <div key={label} className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900 dark:text-slate-200">{label}</label>
                    <Input
                      className="h-11 rounded-xl bg-slate-50/50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-orange dark:text-slate-100 shadow-sm"
                      type={label === "Email" ? "email" : "text"}
                      value={editingAccount[field] as string}
                      onChange={(e) => setEditingAccount({ ...editingAccount, [field]: e.target.value })}
                    />
                  </div>
                );
              })}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-200">Role</label>
                <Select value={editingAccount.role} onValueChange={(val: AccountRole) => setEditingAccount({ ...editingAccount, role: val })}>
                  <SelectTrigger className="h-11 rounded-xl bg-slate-50/50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 focus:ring-1 focus:ring-orange dark:text-slate-100 shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="STUDENT">Student</SelectItem>
                    <SelectItem value="TEACHER">Teacher</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-200">Password</label>
                <Input
                  className="h-11 rounded-xl bg-slate-50/50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-orange dark:text-slate-100 shadow-sm"
                  type="password"
                  value={editingAccount.password}
                  onChange={(e) => setEditingAccount({ ...editingAccount, password: e.target.value })}
                  placeholder={editingAccount.id ? "•••••••• (Leave blank to keep)" : "New Password"}
                />
              </div>
            </div>
          )}
          <div className="px-6 py-5 bg-slate-50/80 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 flex justify-end gap-3">
            <Button variant="outline" className="rounded-xl font-semibold h-11 px-5 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300" onClick={() => setEditingAccount(null)}>Cancel</Button>
            <Button className="rounded-xl font-semibold h-11 px-6 bg-orange hover:bg-orange-hover text-white shadow-md shadow-orange/20" onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}