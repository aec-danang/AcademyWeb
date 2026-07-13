"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Upload, Trash2, Search, Filter, Loader2 } from "lucide-react";
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

      <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Password</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No accounts found matching your criteria.
                </TableCell>
              </TableRow>
            )}
            {filteredRows.map((row, index) => (
              <TableRow key={row.id || `${row.username || row.email || "new"}-${index}`}>
                <TableCell>
                  <Input
                    value={row.name}
                    onChange={(e) => updateRow(row, { name: e.target.value })}
                    placeholder="Full name"
                    className="h-8 bg-transparent border-transparent hover:border-input focus:bg-background"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={row.username}
                    onChange={(e) => updateRow(row, { username: e.target.value })}
                    placeholder="Username"
                    className="h-8 bg-transparent border-transparent hover:border-input focus:bg-background"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="email"
                    value={row.email}
                    onChange={(e) => updateRow(row, { email: e.target.value })}
                    placeholder="name@example.com"
                    className="h-8 bg-transparent border-transparent hover:border-input focus:bg-background"
                  />
                </TableCell>
                <TableCell>
                  <Select value={row.role} onValueChange={(val: AccountRole) => updateRow(row, { role: val })}>
                    <SelectTrigger className="h-8 w-[120px] bg-transparent border-transparent hover:border-input focus:bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">{roleLabels.USER}</SelectItem>
                      <SelectItem value="TEACHER">{roleLabels.TEACHER}</SelectItem>
                      <SelectItem value="ADMIN">{roleLabels.ADMIN}</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    type="password"
                    value={row.password}
                    onChange={(e) => updateRow(row, { password: e.target.value })}
                    placeholder={row.id ? "••••••••" : "New Password"}
                    className="h-8 bg-transparent border-transparent hover:border-input focus:bg-background"
                  />
                </TableCell>
                <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                  {row.createdAt ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(row.createdAt)) : "New row"}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50" onClick={() => handleDelete(row)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex justify-end text-sm text-muted-foreground">
        Showing {filteredRows.length} {filteredRows.length === 1 ? 'account' : 'accounts'}
      </div>

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
            <Button className="bg-orange hover:bg-orange-hover text-white" onClick={handleAddAccount}>Add Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <Button className="bg-orange hover:bg-orange-hover text-white" onClick={handleImportRows}>
              <Upload className="mr-2 h-4 w-4" />
              Import Rows
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}