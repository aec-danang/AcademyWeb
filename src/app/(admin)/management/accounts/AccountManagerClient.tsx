"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Upload, Trash2, Search, Filter, Loader2, Edit } from "lucide-react";
import { deleteAccount, saveAccounts } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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
  USER: "Người dùng (User)",
  TEACHER: "Giáo viên (Teacher)",
  ADMIN: "Quản trị viên (Admin)",
  STUDENT: "Học viên (Student)"
};

function normalizeRole(value: string): AccountRole {
  const normalizedValue = value.trim().toUpperCase();
  if (normalizedValue === "TEACHER") return "TEACHER";
  if (normalizedValue === "ADMIN") return "ADMIN";
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
  const [rows, setRows] = useState(initialUsers.map((user) => ({ ...user, password: "" })));
  const [bulkText, setBulkText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountRow | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [newAccount, setNewAccount] = useState<AccountRow>({
    name: "",
    username: "",
    email: "",
    role: "USER",
    password: "",
    createdAt: "",
    updatedAt: "",
  });

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    const timer = setTimeout(() => {
      setIsSaving(true);
      setError(null);
      saveAccounts(rows)
        .then(() => setIsSaving(false))
        .catch((saveError) => {
          setError(saveError instanceof Error ? saveError.message : "Unable to save accounts right now.");
          setIsSaving(false);
        });
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [rows]);

  const updateRow = (rowToUpdate: AccountRow, patch: Partial<AccountRow>) => {
    setRows((currentRows) => currentRows.map((r) => (r === rowToUpdate ? { ...r, ...patch } : r)));
  };

  const handleAddAccount = () => {
    if (!newAccount.username && !newAccount.email) {
      setError("Username or Email is required.");
      return;
    }
    setRows((currentRows) => [...currentRows, { ...newAccount }]);
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
    setError(null);
  };

  const handleSaveEdit = () => {
    if (!editingAccount) return;
    if (!editingAccount.username && !editingAccount.email) {
      setError("Username or Email is required.");
      return;
    }
    setRows((currentRows) => currentRows.map((r) => (r.id === editingAccount.id && r.username === editingAccount.username ? editingAccount : r)));
    setEditingAccount(null);
    setError(null);
  };

  const handleImportRows = () => {
    const importedRows = parseBulkImport(bulkText);
    if (importedRows.length === 0) {
      setError("Paste at least one line in the format: name,username,email,role,password");
      return;
    }
    setRows((currentRows) => [...currentRows, ...importedRows]);
    setBulkText("");
    setError(null);
    setIsImportModalOpen(false);
  };

  const handleDelete = async (rowToUpdate: AccountRow) => {
    if (!rowToUpdate.id) {
      setRows((currentRows) => currentRows.filter((r) => r !== rowToUpdate));
      return;
    }

    if (!window.confirm(`Delete ${rowToUpdate.username || rowToUpdate.email}?`)) {
      return;
    }

    setIsSaving(true);
    try {
      await deleteAccount(rowToUpdate.id);
      setRows((currentRows) => currentRows.filter((r) => r !== rowToUpdate));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete this account.");
    } finally {
      setIsSaving(false);
    }
  };

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

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
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

      {/* Main Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by name, username, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 focus-visible:ring-orange/20 focus-visible:border-orange shadow-sm transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center text-sm font-medium text-slate-500">
              <Filter className="w-4 h-4 mr-2" />
              Role:
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[160px] h-10 rounded-xl bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 shadow-sm font-medium">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="USER">Student</SelectItem>
                <SelectItem value="TEACHER">Teacher</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-white dark:bg-[#0f172a]">
              <TableRow className="border-b border-slate-200 dark:border-slate-800 hover:bg-transparent">
                <TableHead className="py-4 pl-6 text-xs font-semibold tracking-wider text-slate-500 uppercase w-[220px]">Name</TableHead>
                <TableHead className="py-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Username</TableHead>
                <TableHead className="py-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Email</TableHead>
                <TableHead className="py-4 text-xs font-semibold tracking-wider text-slate-500 uppercase w-[160px]">Role</TableHead>
                <TableHead className="py-4 text-xs font-semibold tracking-wider text-slate-500 uppercase w-[180px]">Password</TableHead>
                <TableHead className="py-4 text-xs font-semibold tracking-wider text-slate-500 uppercase w-[120px]">Created</TableHead>
                <TableHead className="py-4 pr-6 text-right text-xs font-semibold tracking-wider text-slate-500 uppercase">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <Search className="h-8 w-8 mb-3 opacity-20" />
                      <p className="text-base font-medium text-slate-900 dark:text-slate-100">No accounts found</p>
                      <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {filteredRows.map((row, index) => (
                <TableRow key={row.id || `${row.username || row.email || "new"}-${index}`} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group cursor-pointer" onDoubleClick={() => setEditingAccount(row)}>
                  <TableCell className="pl-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                    {row.name || <span className="text-slate-400 italic font-normal">No name</span>}
                  </TableCell>
                  <TableCell className="py-4 text-slate-600 dark:text-slate-300">
                    {row.username || <span className="text-slate-400 italic">-</span>}
                  </TableCell>
                  <TableCell className="py-4 text-slate-600 dark:text-slate-300">
                    {row.email || <span className="text-slate-400 italic">-</span>}
                  </TableCell>
                  <TableCell className="py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      row.role === 'ADMIN' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                      row.role === 'TEACHER' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {roleLabels[row.role] || row.role}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 text-slate-400">
                    {row.password || row.id ? '••••••••' : <span className="italic opacity-50">Not set</span>}
                  </TableCell>
                  <TableCell className="py-4 text-slate-500 dark:text-slate-400 text-xs font-medium whitespace-nowrap">
                    {row.createdAt ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(row.createdAt)) : "New"}
                  </TableCell>
                  <TableCell className="py-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-orange hover:bg-orange/10 transition-colors h-8 w-8 rounded-full" onClick={(e) => { e.stopPropagation(); setEditingAccount(row); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors h-8 w-8 rounded-full" onClick={(e) => { e.stopPropagation(); handleDelete(row); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/30 dark:bg-slate-900/10 flex justify-between items-center text-xs font-medium text-slate-500">
          <span>{filteredRows.length} {filteredRows.length === 1 ? 'account' : 'accounts'} loaded</span>
        </div>
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-[#0b101e]">
          <div className="bg-slate-50/80 dark:bg-slate-900/50 px-6 py-5 border-b border-slate-100 dark:border-slate-800/80">
            <DialogTitle className="text-xl text-slate-900 dark:text-slate-100">Add New Account</DialogTitle>
            <DialogDescription className="mt-1 text-slate-500 dark:text-slate-400">
              Create a new user, teacher, or admin account.
            </DialogDescription>
          </div>
          <div className="px-6 py-6 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-200">Full Name</label>
              <Input className="h-11 rounded-xl bg-slate-50/50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-orange focus-visible:border-orange dark:text-slate-100 shadow-sm" value={newAccount.name} onChange={(e) => setNewAccount({...newAccount, name: e.target.value})} placeholder="e.g. John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-200">Username</label>
              <Input className="h-11 rounded-xl bg-slate-50/50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-orange focus-visible:border-orange dark:text-slate-100 shadow-sm" value={newAccount.username} onChange={(e) => setNewAccount({...newAccount, username: e.target.value})} placeholder="e.g. johndoe" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-200">Email</label>
              <Input className="h-11 rounded-xl bg-slate-50/50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-orange focus-visible:border-orange dark:text-slate-100 shadow-sm" type="email" value={newAccount.email} onChange={(e) => setNewAccount({...newAccount, email: e.target.value})} placeholder="name@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-200">Role</label>
              <Select value={newAccount.role} onValueChange={(val: AccountRole) => setNewAccount({...newAccount, role: val})}>
                <SelectTrigger className="h-11 rounded-xl bg-slate-50/50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 focus:ring-1 focus:ring-orange focus:border-orange dark:text-slate-100 shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                  <SelectItem value="USER" className="dark:focus:bg-slate-800">Student</SelectItem>
                  <SelectItem value="TEACHER" className="dark:focus:bg-slate-800">Teacher</SelectItem>
                  <SelectItem value="ADMIN" className="dark:focus:bg-slate-800">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-200">Password</label>
              <Input className="h-11 rounded-xl bg-slate-50/50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-orange focus-visible:border-orange dark:text-slate-100 shadow-sm" type="password" value={newAccount.password} onChange={(e) => setNewAccount({...newAccount, password: e.target.value})} placeholder="Optional password" />
            </div>
          </div>
          <div className="px-6 py-5 bg-slate-50/80 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 flex justify-end gap-3">
            <Button variant="outline" className="rounded-xl font-semibold h-11 px-5 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button className="rounded-xl font-semibold h-11 px-6 bg-orange hover:bg-orange-hover text-white shadow-md shadow-orange/20" onClick={handleAddAccount}>Create Account</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-[#0b101e]">
          <div className="bg-slate-50/80 dark:bg-slate-900/50 px-6 py-5 border-b border-slate-100 dark:border-slate-800/80">
            <DialogTitle className="text-xl text-slate-900 dark:text-slate-100">Bulk Import Accounts</DialogTitle>
            <DialogDescription className="mt-1 text-slate-500 dark:text-slate-400">
              Paste one account per line using comma, semicolon, or tab separators.
              <br/>
              Format: <strong className="text-slate-700 dark:text-slate-300">name,username,email,role,password</strong>
            </DialogDescription>
          </div>
          <div className="px-6 py-6">
            <Textarea
              rows={8}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="Nguyen Van A,nva123,nva@example.com,student,Temp1234&#10;Tran Thi B,ttb123,ttb@example.com,teacher,Temp1234"
              className="font-mono text-sm rounded-xl resize-none bg-slate-50/50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-orange focus-visible:border-orange dark:text-slate-100 shadow-sm"
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
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-200">Full Name</label>
                <Input className="h-11 rounded-xl bg-slate-50/50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-orange focus-visible:border-orange dark:text-slate-100 shadow-sm" value={editingAccount.name} onChange={(e) => setEditingAccount({...editingAccount, name: e.target.value})} placeholder="e.g. John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-200">Username</label>
                <Input className="h-11 rounded-xl bg-slate-50/50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-orange focus-visible:border-orange dark:text-slate-100 shadow-sm" value={editingAccount.username} onChange={(e) => setEditingAccount({...editingAccount, username: e.target.value})} placeholder="e.g. johndoe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-200">Email</label>
                <Input className="h-11 rounded-xl bg-slate-50/50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-orange focus-visible:border-orange dark:text-slate-100 shadow-sm" type="email" value={editingAccount.email} onChange={(e) => setEditingAccount({...editingAccount, email: e.target.value})} placeholder="name@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-200">Role</label>
                <Select value={editingAccount.role} onValueChange={(val: AccountRole) => setEditingAccount({...editingAccount, role: val})}>
                  <SelectTrigger className="h-11 rounded-xl bg-slate-50/50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 focus:ring-1 focus:ring-orange focus:border-orange dark:text-slate-100 shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                    <SelectItem value="USER" className="dark:focus:bg-slate-800">Student</SelectItem>
                    <SelectItem value="TEACHER" className="dark:focus:bg-slate-800">Teacher</SelectItem>
                    <SelectItem value="ADMIN" className="dark:focus:bg-slate-800">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-200">Password</label>
                <Input className="h-11 rounded-xl bg-slate-50/50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-orange focus-visible:border-orange dark:text-slate-100 shadow-sm" type="password" value={editingAccount.password} onChange={(e) => setEditingAccount({...editingAccount, password: e.target.value})} placeholder={editingAccount.id ? "•••••••• (Leave blank to keep)" : "New Password"} />
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