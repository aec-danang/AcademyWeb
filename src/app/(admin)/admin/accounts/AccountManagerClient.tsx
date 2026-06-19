"use client";

import { useState } from "react";
import { Plus, Upload, Trash2, Save, Users, UserRound, GraduationCap, ShieldCheck } from "lucide-react";
import styles from "../admin.module.css";
import { deleteAccount, saveAccounts } from "./actions";

type AccountRole = "USER" | "TEACHER" | "ADMIN";

type AccountRow = {
  id?: string;
  name: string;
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

  if (normalizedValue === "TEACHER") {
    return "TEACHER";
  }

  if (normalizedValue === "ADMIN") {
    return "ADMIN";
  }

  return "USER";
}

function parseBulkImport(text: string): AccountRow[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name = "", email = "", role = "USER", password = ""] = line.split(/[;,\t]/).map((segment) => segment.trim());

      return {
        name,
        email,
        role: normalizeRole(role),
        password,
        createdAt: "",
        updatedAt: "",
      };
    })
    .filter((row) => row.email.length > 0);
}

export default function AccountManagerClient({ initialUsers }: { initialUsers: AccountRow[] }) {
  const [rows, setRows] = useState(initialUsers.map((user) => ({ ...user, password: "" })));
  const [bulkText, setBulkText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const studentCount = rows.filter((row) => row.role === "USER").length;
  const teacherCount = rows.filter((row) => row.role === "TEACHER").length;
  const adminCount = rows.filter((row) => row.role === "ADMIN").length;

  const updateRow = (index: number, patch: Partial<AccountRow>) => {
    setRows((currentRows) => currentRows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  };

  const addRow = () => {
    setRows((currentRows) => [
      ...currentRows,
      {
        name: "",
        email: "",
        role: "USER",
        password: "",
        createdAt: "",
        updatedAt: "",
      },
    ]);
  };

  const removeLocalRow = (index: number) => {
    setRows((currentRows) => currentRows.filter((_, rowIndex) => rowIndex !== index));
  };

  const handleImportRows = () => {
    const importedRows = parseBulkImport(bulkText);

    if (importedRows.length === 0) {
      setError("Paste at least one line in the format: name,email,role,password");
      return;
    }

    setRows((currentRows) => [...currentRows, ...importedRows]);
    setBulkText("");
    setError(null);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await saveAccounts(rows);
      window.location.reload();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save accounts right now.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (row: AccountRow, index: number) => {
    if (!row.id) {
      removeLocalRow(index);
      return;
    }

    if (!window.confirm(`Delete ${row.email}?`)) {
      return;
    }

    setIsSaving(true);

    try {
      await deleteAccount(row.id);
      window.location.reload();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete this account.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className={styles.flexBetween}>
        <div>
          <h2>Bulk Account Manager</h2>
          <p style={{ margin: "0.5rem 0 0", color: "#64748b" }}>Create, update, and remove student and teacher accounts in one pass.</p>
        </div>
        <button className="btn-primary" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }} onClick={handleSaveAll} disabled={isSaving}>
          <Save size={18} />
          {isSaving ? "Saving..." : "Save All Changes"}
        </button>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>Total Accounts</h3>
            <div style={{ padding: "0.5rem", background: "rgba(239, 68, 68, 0.1)", borderRadius: "10px" }}>
              <Users size={20} color="var(--color-orange)" />
            </div>
          </div>
          <div className={styles.statValue}>{rows.length}</div>
          <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0, fontWeight: 500 }}>Editable roster</p>
        </div>

        <div className={styles.statCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>Students</h3>
            <div style={{ padding: "0.5rem", background: "rgba(30, 58, 138, 0.1)", borderRadius: "10px" }}>
              <GraduationCap size={20} color="var(--color-navy)" />
            </div>
          </div>
          <div className={styles.statValue}>{studentCount}</div>
          <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0, fontWeight: 500 }}>Role USER</p>
        </div>

        <div className={styles.statCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>Teachers</h3>
            <div style={{ padding: "0.5rem", background: "rgba(139, 92, 246, 0.1)", borderRadius: "10px" }}>
              <UserRound size={20} color="#8b5cf6" />
            </div>
          </div>
          <div className={styles.statValue}>{teacherCount}</div>
          <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0, fontWeight: 500 }}>Role TEACHER</p>
        </div>

        <div className={styles.statCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>Admin Accounts</h3>
            <div style={{ padding: "0.5rem", background: "rgba(236, 72, 153, 0.1)", borderRadius: "10px" }}>
              <ShieldCheck size={20} color="#ec4899" />
            </div>
          </div>
          <div className={styles.statValue}>{adminCount}</div>
          <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0, fontWeight: 500 }}>Role ADMIN</p>
        </div>
      </div>

      {error && (
        <div className={styles.cardPanel} style={{ marginBottom: "2rem", border: "1px solid #fecaca", background: "#fff1f2" }}>
          <strong style={{ color: "#b91c1c" }}>Action needed:</strong> <span style={{ color: "#991b1b" }}>{error}</span>
        </div>
      )}

      <div className={styles.cardPanel} style={{ marginBottom: "2rem" }}>
        <h3>Bulk Import</h3>
        <p style={{ marginTop: 0, color: "#64748b" }}>Paste one account per line using: name,email,role,password. Role accepts student, teacher, or admin.</p>
        <div className={styles.formGroup}>
          <textarea
            rows={6}
            value={bulkText}
            onChange={(event) => setBulkText(event.target.value)}
            placeholder="Nguyen Van A,nva@example.com,student,Temp1234\nTran Thi B,ttb@example.com,teacher,Temp1234"
          />
        </div>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <button className="btn-secondary" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }} onClick={handleImportRows}>
            <Upload size={18} />
            Import Rows
          </button>
          <button className="btn-secondary" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }} onClick={addRow}>
            <Plus size={18} />
            Add Blank Row
          </button>
        </div>
      </div>

      <div className={styles.cardPanel}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Password</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "1.5rem" }}>
                  No accounts loaded yet.
                </td>
              </tr>
            )}
            {rows.map((row, index) => (
              <tr key={row.id || `${row.email || "new"}-${index}`}>
                <td>
                  <input
                    type="text"
                    value={row.name}
                    onChange={(event) => updateRow(index, { name: event.target.value })}
                    placeholder="Full name"
                    className={styles.tableField}
                  />
                </td>
                <td>
                  <input
                    type="email"
                    value={row.email}
                    onChange={(event) => updateRow(index, { email: event.target.value })}
                    placeholder="name@example.com"
                    className={styles.tableField}
                  />
                </td>
                <td>
                  <select value={row.role} onChange={(event) => updateRow(index, { role: normalizeRole(event.target.value) })} className={styles.tableField}>
                    <option value="USER">{roleLabels.USER}</option>
                    <option value="TEACHER">{roleLabels.TEACHER}</option>
                    <option value="ADMIN">{roleLabels.ADMIN}</option>
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    value={row.password}
                    onChange={(event) => updateRow(index, { password: event.target.value })}
                    placeholder="Optional"
                    className={styles.tableField}
                  />
                </td>
                <td>
                  <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                    {row.createdAt ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(row.createdAt)) : "New row"}
                  </div>
                </td>
                <td>
                  <div className={styles.actionButtons}>
                    <button className={styles.btnDelete} title="Remove row" onClick={() => handleDelete(row, index)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}