"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Upload, Trash2, X, Search, Filter, Loader2 } from "lucide-react";
import styles from "../admin.module.css";
import { deleteAccount, saveAccounts } from "./actions";

type AccountRole = "USER" | "TEACHER" | "ADMIN";

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
    <div>
      <div className={styles.flexBetween} style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <h2 style={{ margin: 0 }}>Account Manager</h2>
          {isSaving && <Loader2 size={18} color="#64748b" className={styles.spin} />}
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button className="btn-secondary" style={{ display: "flex", gap: "0.5rem", alignItems: "center", padding: "10px 16px", fontSize: "0.9rem" }} onClick={() => setIsImportModalOpen(true)}>
            <Upload size={16} />
            Bulk Import
          </button>
          <button className="btn-primary" style={{ display: "flex", gap: "0.5rem", alignItems: "center", padding: "10px 16px", fontSize: "0.9rem" }} onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} />
            Add Account
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.cardPanel} style={{ marginBottom: "2rem", border: "1px solid #fecaca", background: "#fff1f2", padding: "1.5rem" }}>
          <strong style={{ color: "#b91c1c" }}>Action needed:</strong> <span style={{ color: "#991b1b" }}>{error}</span>
        </div>
      )}

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1, minWidth: "250px", maxWidth: "600px" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                type="text"
                placeholder="Search accounts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div style={{ position: "relative" }}>
              <Filter size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="ALL">All Roles</option>
                <option value="USER">Student</option>
                <option value="TEACHER">Teacher</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Password</th>
                <th>Created</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "3rem 1rem", color: "#64748b" }}>
                    No accounts found matching your criteria.
                  </td>
                </tr>
              )}
              {filteredRows.map((row, index) => (
                <tr key={row.id || `${row.username || row.email || "new"}-${index}`}>
                  <td>
                    <input
                      type="text"
                      value={row.name}
                      onChange={(event) => updateRow(row, { name: event.target.value })}
                      placeholder="Full name"
                      className={styles.cleanInput}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.username}
                      onChange={(event) => updateRow(row, { username: event.target.value })}
                      placeholder="Username"
                      className={styles.cleanInput}
                    />
                  </td>
                  <td>
                    <input
                      type="email"
                      value={row.email}
                      onChange={(event) => updateRow(row, { email: event.target.value })}
                      placeholder="name@example.com"
                      className={styles.cleanInput}
                    />
                  </td>
                  <td>
                    <select value={row.role} onChange={(event) => updateRow(row, { role: normalizeRole(event.target.value) })} className={styles.cleanSelect}>
                      <option value="USER">{roleLabels.USER}</option>
                      <option value="TEACHER">{roleLabels.TEACHER}</option>
                      <option value="ADMIN">{roleLabels.ADMIN}</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.password}
                      onChange={(event) => updateRow(row, { password: event.target.value })}
                      placeholder={row.id ? "••••••••" : "New Password"}
                      className={styles.cleanInput}
                    />
                  </td>
                  <td>
                    <div style={{ fontSize: "0.85rem", color: "#64748b", paddingLeft: "0.5rem", whiteSpace: "nowrap" }}>
                      {row.createdAt ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(row.createdAt)) : "New row"}
                    </div>
                  </td>
                  <td>
                    <div className={styles.actionButtons} style={{ justifyContent: "flex-end" }}>
                      <button className={styles.btnDelete} title="Remove row" onClick={() => handleDelete(row)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#64748b", display: "flex", justifyContent: "flex-end" }}>
          Showing {filteredRows.length} {filteredRows.length === 1 ? 'account' : 'accounts'}
        </div>
      </div>

      {isAddModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Add New Account</h3>
              <button className={styles.btnClose} onClick={() => setIsAddModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.formGroup}>
              <label>Full Name</label>
              <input type="text" value={newAccount.name} onChange={(e) => setNewAccount({...newAccount, name: e.target.value})} placeholder="e.g. John Doe" />
            </div>
            <div className={styles.formGroup}>
              <label>Username</label>
              <input type="text" value={newAccount.username} onChange={(e) => setNewAccount({...newAccount, username: e.target.value})} placeholder="e.g. johndoe" />
            </div>
            <div className={styles.formGroup}>
              <label>Email</label>
              <input type="email" value={newAccount.email} onChange={(e) => setNewAccount({...newAccount, email: e.target.value})} placeholder="name@example.com" />
            </div>
            <div className={styles.formGroup}>
              <label>Role</label>
              <select value={newAccount.role} onChange={(e) => setNewAccount({...newAccount, role: normalizeRole(e.target.value)})}>
                <option value="USER">Student</option>
                <option value="TEACHER">Teacher</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Password</label>
              <input type="text" value={newAccount.password} onChange={(e) => setNewAccount({...newAccount, password: e.target.value})} placeholder="Optional password" />
            </div>
            
            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
              <button className="btn-secondary" onClick={() => setIsAddModalOpen(false)} style={{ padding: "10px 20px" }}>Cancel</button>
              <button className="btn-primary" onClick={handleAddAccount} style={{ padding: "10px 20px" }}>Add Account</button>
            </div>
          </div>
        </div>
      )}

      {isImportModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Bulk Import Accounts</h3>
              <button className={styles.btnClose} onClick={() => setIsImportModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <p style={{ marginTop: 0, marginBottom: "1.5rem", color: "#64748b", fontSize: "0.95rem" }}>
              Paste one account per line using comma, semicolon, or tab separators. 
              <br />
              Format: <strong>name,username,email,role,password</strong>
              <br />
              <small>Role accepts student, teacher, or admin.</small>
            </p>
            
            <div className={styles.formGroup}>
              <textarea
                rows={8}
                value={bulkText}
                onChange={(event) => setBulkText(event.target.value)}
                placeholder="Nguyen Van A,nva123,nva@example.com,student,Temp1234&#10;Tran Thi B,ttb123,ttb@example.com,teacher,Temp1234"
                style={{ fontFamily: "monospace", fontSize: "0.85rem", whiteSpace: "pre" }}
              />
            </div>
            
            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "1rem" }}>
              <button className="btn-secondary" onClick={() => setIsImportModalOpen(false)} style={{ padding: "10px 20px" }}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleImportRows} style={{ display: "flex", gap: "0.5rem", alignItems: "center", padding: "10px 20px" }}>
                <Upload size={18} />
                Import Rows
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}