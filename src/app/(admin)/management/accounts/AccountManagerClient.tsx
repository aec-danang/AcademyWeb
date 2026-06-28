"use client";

import { useState } from "react";
import { Plus, Upload, Trash2, Search, Loader2, Edit2 } from "lucide-react";
import { deleteAccount, saveAccounts } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type AccountRole = "USER" | "TEACHER" | "ADMIN";

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
  USER: "Student",
  TEACHER: "Teacher",
  ADMIN: "Admin",
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
  const [rows, setRows] = useState(initialUsers);
  const [bulkText, setBulkText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  const handleAddAccount = async () => {
    if (!newAccount.username && !newAccount.email) {
      setError("Username or Email is required.");
      return;
    }
    
    setIsSaving(true);
    try {
      await saveAccounts([newAccount]);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save account.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImportRows = async () => {
    const importedRows = parseBulkImport(bulkText);
    if (importedRows.length === 0) {
      setError("Paste at least one line in the format: name,username,email,role,password");
      return;
    }
    
    setIsSaving(true);
    try {
      await saveAccounts(importedRows);
      setRows((currentRows) => [...currentRows, ...importedRows]);
      setBulkText("");
      setError(null);
      setIsImportModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import accounts.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditSave = async () => {
    if (!editingAccount) return;
    if (!editingAccount.username && !editingAccount.email) {
      setError("Username or Email is required.");
      return;
    }
    
    setIsSaving(true);
    try {
      await saveAccounts([editingAccount]);
      setRows((currentRows) => currentRows.map((r) => r.id === editingAccount.id ? editingAccount : r));
      setIsEditModalOpen(false);
      setEditingAccount(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save account.");
    } finally {
      setIsSaving(false);
    }
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold tracking-tight text-navy dark:text-white">Account Manager</h2>
          {isSaving && <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Bulk Import
          </Button>
          <Button className="bg-orange hover:bg-orange-hover text-white" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            <strong className="font-semibold">Action needed:</strong> {error}
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white dark:bg-slate-900"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-slate-900">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="USER">Student</SelectItem>
            <SelectItem value="TEACHER">Teacher</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] bg-white dark:bg-slate-900/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No accounts found matching your criteria.
                </TableCell>
              </TableRow>
            )}
            {filteredRows.map((row, index) => (
              <TableRow key={row.id || `${row.username || row.email || "new"}-${index}`}>
                <TableCell className="font-medium text-navy dark:text-slate-200">
                  {row.name || <span className="text-muted-foreground italic">No name</span>}
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {row.username || "-"}
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {row.email || "-"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    row.role === "ADMIN" ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800" :
                    row.role === "TEACHER" ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800" :
                    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                  }>
                    {roleLabels[row.role]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                  {row.createdAt ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(row.createdAt)) : "New row"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingAccount({...row, password: ""}); setIsEditModalOpen(true); }}>
                      <Edit2 className="h-4 w-4 text-slate-500" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50" onClick={() => handleDelete(row)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex justify-end text-sm text-muted-foreground">
        Showing {filteredRows.length} {filteredRows.length === 1 ? 'account' : 'accounts'}
      </div>

      {/* Edit Account Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={(open) => { setIsEditModalOpen(open); if (!open) setEditingAccount(null); }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
            <DialogDescription>Modify the details for this account and click save.</DialogDescription>
          </DialogHeader>
          {editingAccount && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input value={editingAccount.name} onChange={(e) => setEditingAccount({...editingAccount, name: e.target.value})} placeholder="e.g. John Doe" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Username</label>
                <Input value={editingAccount.username} onChange={(e) => setEditingAccount({...editingAccount, username: e.target.value})} placeholder="e.g. johndoe" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" value={editingAccount.email} onChange={(e) => setEditingAccount({...editingAccount, email: e.target.value})} placeholder="name@example.com" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={editingAccount.role} onValueChange={(val: AccountRole) => setEditingAccount({...editingAccount, role: val})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Student</SelectItem>
                    <SelectItem value="TEACHER">Teacher</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">New Password</label>
                <Input type="password" value={editingAccount.password || ""} onChange={(e) => setEditingAccount({...editingAccount, password: e.target.value})} placeholder="Leave blank to keep current password" />
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Account</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input value={newAccount.name} onChange={(e) => setNewAccount({...newAccount, name: e.target.value})} placeholder="e.g. John Doe" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Username</label>
              <Input value={newAccount.username} onChange={(e) => setNewAccount({...newAccount, username: e.target.value})} placeholder="e.g. johndoe" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={newAccount.email} onChange={(e) => setNewAccount({...newAccount, email: e.target.value})} placeholder="name@example.com" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={newAccount.role} onValueChange={(val: AccountRole) => setNewAccount({...newAccount, role: val})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Student</SelectItem>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Password</label>
              <Input type="password" value={newAccount.password} onChange={(e) => setNewAccount({...newAccount, password: e.target.value})} placeholder="Optional password" />
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
        <DialogContent className="sm:max-w-[500px]">
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
              className="font-mono text-sm"
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