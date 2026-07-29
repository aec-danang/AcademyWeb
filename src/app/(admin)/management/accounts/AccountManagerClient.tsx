"use client";

import { useState, useMemo } from "react";
import { Plus, Upload, Trash2, Search, Loader2, Edit, MoreHorizontal, User, GraduationCap, ShieldCheck, UserCheck, AlertTriangle, Layers, Download, Calendar, ArrowUpDown, ChevronDown, ChevronRight, CheckCircle2, Lock, Key, Eye } from "lucide-react";
import { deleteAccount, saveAccounts } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

type AccountRole = "USER" | "TEACHER" | "ADMIN" | "STUDENT";

type EnrollmentInfo = {
  id: string;
  status: string;
  createdAt: string;
  classSection: {
    id: string;
    name: string;
    code: string;
    startAt: string | null;
    endAt: string | null;
    course?: { id: string; title: string; program: string | null } | null;
    teacher?: { id: string; name: string | null } | null;
  };
};

type AccountRow = {
  id?: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  role: AccountRole;
  image?: string | null;
  emailVerified?: string | null;
  password?: string;
  createdAt: string;
  updatedAt: string;
  classSectionId?: string;
  startDate?: string;
  endDate?: string;
  enrollments?: EnrollmentInfo[];
  classSections?: { id: string; name: string; code: string }[];
};

type ClassItem = {
  id: string;
  name: string;
  code: string;
  program: string;
  startAt: string | null;
  endAt: string | null;
};

type ProgramItem = {
  id: string;
  title: string;
  slug: string;
};

const roleLabels: Record<AccountRole, string> = {
  USER: "Người dùng vãng lai",
  TEACHER: "Giảng viên",
  ADMIN: "Quản trị viên",
  STUDENT: "Học viên",
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

function formatDateForInput(str?: string | null): string {
  if (!str) return "";
  const s = String(str).trim();

  // Match DD/MM/YYYY
  const ddmmyyyy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (ddmmyyyy) {
    const day = ddmmyyyy[1].padStart(2, "0");
    const month = ddmmyyyy[2].padStart(2, "0");
    const year = ddmmyyyy[3];
    return `${year}-${month}-${day}`;
  }

  // Match YYYY-MM-DD or ISO string
  if (s.length >= 10 && s[4] === "-" && s[7] === "-") {
    return s.slice(0, 10);
  }

  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return "";
}

function getStudentValidityStatus(enrollments?: EnrollmentInfo[]): {
  status: "ACTIVE" | "EXPIRED" | "NO_CLASS";
  label: string;
  badgeClass: string;
  classList: { id: string; name: string; teacherName?: string }[];
} {
  if (!enrollments || enrollments.length === 0) {
    return {
      status: "NO_CLASS",
      label: "Chưa xếp lớp",
      badgeClass: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 font-semibold",
      classList: [],
    };
  }

  const mappedClasses = enrollments.map((e) => ({
    id: e.classSection.id,
    name: e.classSection.name,
    teacherName: e.classSection.teacher?.name || undefined,
  }));

  const activeEnr = enrollments[0];
  const classSec = activeEnr.classSection;
  const endAtStr = classSec.endAt;

  if (!endAtStr) {
    return {
      status: "ACTIVE",
      label: "Đang hiệu lực",
      badgeClass: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold",
      classList: mappedClasses,
    };
  }

  const endDate = new Date(endAtStr);
  const now = new Date();

  if (endDate.getTime() < now.getTime()) {
    return {
      status: "EXPIRED",
      label: "Hết hạn",
      badgeClass: "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 font-bold",
      classList: mappedClasses,
    };
  }

  return {
    status: "ACTIVE",
    label: "Đang hiệu lực",
    badgeClass: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold",
    classList: mappedClasses,
  };
}

export default function AccountManagerClient({
  initialUsers,
  classList = [],
}: {
  initialUsers: AccountRow[];
  classList?: ClassItem[];
  programList?: ProgramItem[];
}) {
  const uniqueInitialUsers = useMemo(() => {
    const map = new Map<string, AccountRow>();
    for (const u of initialUsers) {
      const key = (u.email || u.username || u.id || "").toLowerCase();
      if (!map.has(key)) {
        map.set(key, u);
      }
    }
    return Array.from(map.values());
  }, [initialUsers]);

  const [rows, setRows] = useState<AccountRow[]>(uniqueInitialUsers.map((u) => ({ ...u, password: "" })));
  const [bulkText, setBulkText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [activeTab, setActiveTab] = useState<"STUDENT" | "TEACHER" | "ADMIN" | "USER">("STUDENT");

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountRow | null>(null);

  const [expandedUserIds, setExpandedUserIds] = useState<Set<string>>(new Set());

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("ALL");
  const [validityFilter, setValidityFilter] = useState("ALL");
  const [sortField, setSortField] = useState<"name" | "createdAt" | "role">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [newAccount, setNewAccount] = useState<AccountRow>({
    name: "",
    username: "",
    email: "",
    phone: "",
    role: "STUDENT",
    password: "",
    createdAt: "",
    updatedAt: "",
    startDate: "",
    endDate: "",
    classSectionId: "",
  });

  const toggleExpandUser = (userId: string) => {
    setExpandedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const metrics = useMemo(() => {
    const students = rows.filter((r) => r.role === "STUDENT");
    const teachers = rows.filter((r) => r.role === "TEACHER");
    const admins = rows.filter((r) => r.role === "ADMIN");
    const users = rows.filter((r) => r.role === "USER");

    let expiringSoonCount = 0;
    let unassignedCount = 0;

    students.forEach((s) => {
      const validity = getStudentValidityStatus(s.enrollments);
      if (validity.status === "EXPIRED") {
        expiringSoonCount++;
      }
      if (validity.status === "NO_CLASS") {
        unassignedCount++;
      }
    });

    return {
      totalUsersCount: rows.length,
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalAdmins: admins.length,
      totalUsers: users.length,
      expiringSoonCount,
      unassignedCount,
    };
  }, [rows]);

  const filteredRows = useMemo(() => {
    let result = rows.filter((row) => {
      if (normalizeRole(row.role) !== activeTab) return false;

      if (search) {
        const term = search.toLowerCase();
        const matchesName = row.name.toLowerCase().includes(term);
        const matchesUser = row.username.toLowerCase().includes(term);
        const matchesEmail = row.email.toLowerCase().includes(term);
        const matchesPhone = (row.phone || "").toLowerCase().includes(term);
        if (!matchesName && !matchesUser && !matchesEmail && !matchesPhone) return false;
      }

      if (activeTab === "STUDENT" && classFilter !== "ALL") {
        if (classFilter === "UNASSIGNED") {
          if (row.enrollments && row.enrollments.length > 0) return false;
        } else {
          const hasClass = row.enrollments?.some((e) => e.classSection.id === classFilter);
          if (!hasClass) return false;
        }
      }

      if (activeTab === "STUDENT" && validityFilter !== "ALL") {
        const val = getStudentValidityStatus(row.enrollments);
        if (validityFilter === "EXPIRING" && val.status !== "EXPIRED") return false;
        if (validityFilter === "ACTIVE" && val.status !== "ACTIVE") return false;
        if (validityFilter === "NO_CLASS" && val.status !== "NO_CLASS") return false;
      }

      return true;
    });

    result.sort((a, b) => {
      let valA: string | number = a[sortField] || "";
      let valB: string | number = b[sortField] || "";
      if (sortField === "createdAt") {
        valA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        valB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      }
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [rows, activeTab, search, classFilter, validityFilter, sortField, sortOrder]);

  const saveRow = async (updatedRows: AccountRow[]) => {
    setIsSaving(true);
    try {
      await saveAccounts(
        updatedRows.map((r) => ({
          ...r,
          id: r.id || undefined,
        }))
      );
      toast.success("Đã lưu danh sách tài khoản thành công.");
    } catch (err: any) {
      const errMsg = err?.message || "Không thể lưu tài khoản. Vui lòng kiểm tra lại.";
      toast.error(errMsg, { duration: 6000 });
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!newAccount.username && !newAccount.email) {
      toast.error("Username hoặc Email là bắt buộc.");
      return;
    }
    const next = [newAccount, ...rows];
    setRows(next);
    setNewAccount({
      name: "",
      username: "",
      email: "",
      phone: "",
      role: activeTab,
      password: "",
      createdAt: "",
      updatedAt: "",
      startDate: "",
      endDate: "",
      classSectionId: "",
    });
    setIsAddModalOpen(false);
    await saveRow(next);
  };

  const handleEditSave = async () => {
    if (!editingAccount) return;
    const target = editingAccount;
    setEditingAccount(null);
    const next = rows.map((r) => ((r.id && r.id === target.id) || r.username === target.username ? target : r));
    setRows(next);
    await saveRow([target]);
  };

  const handleExportFilteredExcel = async () => {
    try {
      const XLSX = await import("xlsx");
      const targetRows = filteredRows.length > 0 ? filteredRows : rows.filter((r) => normalizeRole(r.role) === activeTab);

      if (targetRows.length === 0) {
        toast.error("Không có tài khoản nào để xuất.");
        return;
      }

      const exportData = targetRows.map((r) => {
        const val = getStudentValidityStatus(r.enrollments);
        return {
          "Họ tên": r.name || "—",
          Username: r.username,
          Email: r.email || "—",
          "Số điện thoại": r.phone || "—",
          "Vai trò": roleLabels[normalizeRole(r.role)],
          "Lớp học tham gia": val.classList.map((c) => c.name).join(", ") || "Chưa xếp lớp",
          "Trạng thái / Hiệu lực": val.label,
          "Email Xác thực": r.emailVerified ? "Đã xác thực" : "Chưa xác thực",
          "Ngày tạo": r.createdAt ? new Intl.DateTimeFormat("vi-VN").format(new Date(r.createdAt)) : "Mới",
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, `DanhSach_${activeTab}`);

      const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Danh_Sach_Tai_Khoan_${activeTab}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Đã xuất ${targetRows.length} tài khoản thành công.`);
    } catch {
      toast.error("Không thể xuất file Excel.");
    }
  };

  const handleDownloadSample = async () => {
    try {
      const XLSX = await import("xlsx");
      const sampleData = [
        {
          "Họ tên": "Nguyễn Văn A",
          Username: "nguyenvana",
          Email: "hocviena@gmail.com",
          "Số điện thoại": "0987654321",
          "Vai trò": "STUDENT",
          "Mật khẩu": "123456",
          "Lớp học": "Lớp Starter-K24",
          "Ngày nhập học (dd/mm/yyyy)": "01/01/2026",
          "Ngày hết hạn (dd/mm/yyyy)": "01/07/2026",
        },
        {
          "Họ tên": "Trần Thị B",
          Username: "tranthib",
          Email: "hocvienb@gmail.com",
          "Số điện thoại": "0912345678",
          "Vai trò": "STUDENT",
          "Mật khẩu": "123456",
          "Lớp học": "Lớp IELTS-T1",
          "Ngày nhập học (dd/mm/yyyy)": "15/02/2026",
          "Ngày hết hạn (dd/mm/yyyy)": "15/08/2026",
        },
      ];

      const worksheet = XLSX.utils.json_to_sheet(sampleData);
      worksheet["!cols"] = [
        { wch: 20 },
        { wch: 15 },
        { wch: 25 },
        { wch: 15 },
        { wch: 12 },
        { wch: 12 },
        { wch: 20 },
        { wch: 25 },
        { wch: 25 },
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachHocVienMau");

      const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Danh_Sach_Hoc_Vien_Mau.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Đã tải xuống file Excel mẫu mới nhất.");
    } catch {
      toast.error("Không thể tạo file mẫu Excel.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const XLSX = await import("xlsx");
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { cellDates: true, dateNF: "dd/mm/yyyy" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const objects = XLSX.utils.sheet_to_json<any>(worksheet);

      if (!objects || objects.length === 0) {
        toast.error("File Excel không có dữ liệu hợp lệ.");
        return;
      }

      const imported: AccountRow[] = [];
      for (const item of objects) {
        const getVal = (keys: string[]) => {
          for (const key of Object.keys(item)) {
            const cleanKey = key.toLowerCase().trim();
            if (keys.some((k) => cleanKey.includes(k.toLowerCase()))) {
              const val = item[key];
              if (!val && val !== 0) return "";
              if (val instanceof Date) {
                const d = val.getDate().toString().padStart(2, "0");
                const m = (val.getMonth() + 1).toString().padStart(2, "0");
                const y = val.getFullYear();
                return `${d}/${m}/${y}`;
              }
              return String(val).trim();
            }
          }
          return "";
        };

        const name = getVal(["họ tên", "name", "ho ten"]);
        const username = getVal(["username", "tài khoản", "tai khoan"]);
        const email = getVal(["email", "hòm thư"]);
        const phone = getVal(["điện thoại", "phone", "sdt", "số điện"]);
        const role = normalizeRole(getVal(["vai trò", "role"]) || "STUDENT");
        const password = getVal(["mật khẩu", "password"]);
        const classSectionId = getVal(["lớp", "class", "mã lớp"]);
        const startDate = getVal(["bắt đầu", "nhập học", "start"]);
        const endDate = getVal(["kết thúc", "hết hạn", "end"]);

        if (email || username) {
          const finalUsername = username || (email ? email.split("@")[0] : "");
          if (finalUsername) {
            imported.push({
              name: name || username || email || "Học viên",
              username: finalUsername,
              email: email || "",
              phone: phone || "",
              role,
              password,
              classSectionId: classSectionId || undefined,
              startDate: startDate || undefined,
              endDate: endDate || undefined,
              createdAt: "",
              updatedAt: "",
            });
          }
        }
      }

      if (imported.length === 0) {
        toast.error("Không tìm thấy dòng học viên hợp lệ.");
        return;
      }

      const next = [...imported, ...rows];
      setRows(next);
      setIsImportModalOpen(false);
      await saveRow(next);
      toast.success(`Đã nhập và lưu thành công ${imported.length} tài khoản từ file Excel.`);
    } catch {
      toast.error("Không thể đọc file Excel này.");
    }
  };

  const handleImportRows = async () => {
    if (!bulkText.trim()) {
      toast.error("Vui lòng dán ít nhất 1 dòng đúng định dạng.");
      return;
    }
    const lines = bulkText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const imported: AccountRow[] = lines.map((line) => {
      const [name = "", username = "", email = "", phone = "", role = "STUDENT", password = "", classSectionId = "", startDate = "", endDate = ""] = line
        .split(/[;,\t]/)
        .map((s) => s.trim());
      return {
        name,
        username: username || (email ? email.split("@")[0] : `user_${Date.now()}`),
        email,
        phone,
        role: normalizeRole(role),
        password,
        classSectionId: classSectionId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        createdAt: "",
        updatedAt: "",
      };
    }).filter((r) => r.email || r.username);

    if (imported.length === 0) {
      toast.error("Không có dòng dữ liệu nào hợp lệ.");
      return;
    }

    const next = [...imported, ...rows];
    setRows(next);
    setBulkText("");
    setIsImportModalOpen(false);
    await saveRow(next);
  };

  const handleDelete = async (row: AccountRow) => {
    if (!row.id) {
      setRows((prev) => prev.filter((r) => r !== row));
      return;
    }
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản ${row.name || row.username || row.email}?`)) return;
    setIsSaving(true);
    try {
      await deleteAccount(row.id);
      setRows((prev) => prev.filter((r) => r !== row));
      toast.success("Đã xóa tài khoản.");
    } catch {
      toast.error("Xóa tài khoản thất bại.");
    } finally {
      setIsSaving(false);
    }
  };

  const rowKey = (r: AccountRow, i: number) => r.id || `${r.username}-${r.email}-${i}`;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Quản lý Tài khoản & Phân lớp</h2>
            {isSaving && <Loader2 className="h-5 w-5 text-orange animate-spin" />}
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Tổng số tài khoản trong hệ thống: <strong className="text-slate-900 dark:text-slate-100">{metrics.totalUsersCount}</strong> tài khoản duy nhất.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={handleDownloadSample}
            className="rounded-xl h-10 px-4 border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300"
          >
            <Download className="mr-2 h-4 w-4 text-emerald-600" />
            Tải File Excel mẫu (.xlsx)
          </Button>
          <Button
            variant="outline"
            onClick={handleExportFilteredExcel}
            className="rounded-xl h-10 px-4 border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300"
          >
            <Download className="mr-2 h-4 w-4 text-orange" />
            Xuất dữ liệu Excel ({filteredRows.length > 0 ? filteredRows.length : rows.filter(r => normalizeRole(r.role) === activeTab).length})
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsImportModalOpen(true)}
            className="rounded-xl h-10 px-4 border-slate-200 dark:border-slate-800 font-semibold"
          >
            <Upload className="mr-2 h-4 w-4" />
            Nhập Excel
          </Button>
          <Button
            onClick={() => {
              setNewAccount({
                name: "",
                username: "",
                email: "",
                phone: "",
                role: activeTab,
                password: "",
                createdAt: "",
                updatedAt: "",
                startDate: "",
                endDate: "",
                classSectionId: "",
              });
              setIsAddModalOpen(true);
            }}
            className="rounded-xl h-10 px-5 bg-orange hover:bg-orange-hover text-white shadow-lg shadow-orange/20 font-semibold"
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm tài khoản
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Học viên Active</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">{metrics.totalStudents}</h4>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Sắp / Đã hết hạn</p>
            <h4 className="text-2xl font-black text-amber-900 dark:text-amber-300">{metrics.expiringSoonCount}</h4>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Giảng viên Vận hành</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">{metrics.totalTeachers}</h4>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-400">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Chờ xếp lớp</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">{metrics.unassignedCount}</h4>
          </div>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as AccountRole)}
        className="w-full space-y-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
          <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
            <TabsTrigger value="STUDENT" className="rounded-lg text-xs font-semibold px-4 py-2 flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Học viên ({metrics.totalStudents})
            </TabsTrigger>
            <TabsTrigger value="TEACHER" className="rounded-lg text-xs font-semibold px-4 py-2 flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Giảng viên ({metrics.totalTeachers})
            </TabsTrigger>
            <TabsTrigger value="ADMIN" className="rounded-lg text-xs font-semibold px-4 py-2 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Quản trị viên ({metrics.totalAdmins})
            </TabsTrigger>
            <TabsTrigger value="USER" className="rounded-lg text-xs font-semibold px-4 py-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              Vãng lai ({metrics.totalUsers})
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-[240px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Tìm tên, email, sđt, username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800"
              />
            </div>

            {activeTab === "STUDENT" && (
              <>
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="w-[150px] h-9 rounded-xl bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 text-xs font-semibold">
                    <SelectValue placeholder="Lọc Lớp học" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="ALL">Tất cả lớp học</SelectItem>
                    <SelectItem value="UNASSIGNED">Chưa xếp lớp</SelectItem>
                    {classList.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={validityFilter} onValueChange={setValidityFilter}>
                  <SelectTrigger className="w-[160px] h-9 rounded-xl bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 text-xs font-semibold">
                    <SelectValue placeholder="Lọc Thời hạn" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="ALL">Tất cả thời hạn</SelectItem>
                    <SelectItem value="ACTIVE">🟢 Đang hoạt động</SelectItem>
                    <SelectItem value="EXPIRING">⚠️ Sắp / Đã hết hạn</SelectItem>
                    <SelectItem value="NO_CLASS">⚪ Chưa xếp lớp</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-2 text-xs text-slate-500 gap-1 rounded-xl"
              onClick={() => {
                setSortField("name");
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
              }}
            >
              <ArrowUpDown className="h-3.5 w-3.5" /> Sắp xếp Tên
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/80 dark:bg-slate-800/40 backdrop-blur-sm">
              <TableRow className="border-slate-200 dark:border-slate-800">
                <TableHead className="w-[240px] text-xs font-semibold tracking-wider text-slate-500 uppercase py-3">
                  Tài khoản (Username & Họ tên)
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-wider text-slate-500 uppercase py-3">
                  Liên hệ (Email & SĐT)
                </TableHead>
                <TableHead className="w-[100px] text-xs font-semibold tracking-wider text-slate-500 uppercase py-3">Vai trò</TableHead>
                {activeTab === "STUDENT" && (
                  <>
                    <TableHead className="w-[220px] text-xs font-semibold tracking-wider text-slate-500 uppercase py-3">Lớp tham gia</TableHead>
                    <TableHead className="w-[180px] text-xs font-semibold tracking-wider text-slate-500 uppercase py-3">Hiệu lực khóa học</TableHead>
                  </>
                )}
                <TableHead className="w-[110px] text-center text-xs font-semibold tracking-wider text-slate-500 uppercase py-3">Ngày tạo</TableHead>
                <TableHead className="w-[80px] text-right text-xs font-semibold tracking-wider text-slate-500 uppercase py-3 px-6">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={activeTab === "STUDENT" ? 7 : 5} className="h-40 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <User className="h-7 w-7 text-slate-300 dark:text-slate-600" />
                      <p className="text-xs">Không tìm thấy tài khoản nào khớp bộ lọc.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((row, index) => {
                  const key = rowKey(row, index);
                  const validity = activeTab === "STUDENT" ? getStudentValidityStatus(row.enrollments) : null;
                  const isExpanded = expandedUserIds.has(row.id || key);
                  const firstLetter = (row.name || row.username || "U").charAt(0).toUpperCase();

                  return (
                    <TableRow key={key} className="group border-slate-200 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-800">
                            <AvatarImage src={row.image || ""} />
                            <AvatarFallback className="bg-orange/10 text-orange font-bold text-xs">{firstLetter}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100 leading-tight">
                              @{row.username || "no-user"}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[150px]">
                              {row.name || "Chưa đặt tên"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-2.5 text-xs">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{row.email || "Chưa có email"}</span>
                            {row.emailVerified && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                          </div>
                          {row.phone && <span className="text-[11px] text-slate-400">{row.phone}</span>}
                        </div>
                      </TableCell>

                      <TableCell className="py-2.5">
                        <Badge variant="outline" className={`text-[11px] font-bold px-2 py-0.5 shadow-none ${roleBadgeClass[row.role]}`}>
                          {roleLabels[row.role]}
                        </Badge>
                      </TableCell>

                      {activeTab === "STUDENT" && validity && (
                        <>
                          <TableCell className="py-2.5 text-xs">
                            {validity.classList.length === 0 ? (
                              <span className="text-[11px] text-slate-400 italic">Chưa xếp lớp</span>
                            ) : (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <span className="font-bold text-slate-800 dark:text-slate-200">{validity.classList[0].name}</span>
                                  {validity.classList.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => toggleExpandUser(row.id || key)}
                                      className="text-[10px] font-bold text-orange bg-orange/10 hover:bg-orange/20 px-1.5 py-0.5 rounded flex items-center gap-0.5"
                                    >
                                      +{validity.classList.length - 1} lớp
                                      {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                    </button>
                                  )}
                                </div>
                                {isExpanded && validity.classList.length > 1 && (
                                  <div className="mt-1 pl-2 border-l-2 border-orange/40 space-y-0.5 animate-in fade-in">
                                    {validity.classList.slice(1).map((c, i) => (
                                      <div key={i} className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                                        • {c.name}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </TableCell>

                          <TableCell className="py-2.5">
                            <Badge variant="outline" className={`text-[11px] px-2 py-0.5 ${validity.badgeClass}`}>
                              {validity.label}
                            </Badge>
                          </TableCell>
                        </>
                      )}

                      <TableCell className="py-2.5 text-center text-xs text-slate-500 whitespace-nowrap">
                        {row.createdAt
                          ? new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(row.createdAt))
                          : "28/07/2026"}
                      </TableCell>

                      <TableCell className="text-right px-6 py-2.5">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-7 w-7 p-0 text-slate-400 hover:text-slate-900">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[170px] rounded-xl shadow-lg border-slate-200 dark:border-slate-800">
                            <DropdownMenuLabel className="text-[11px] uppercase text-slate-400">Thao tác tài khoản</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setEditingAccount(row)} className="cursor-pointer text-xs font-semibold">
                              <Eye className="mr-2 h-3.5 w-3.5 text-slate-500" /> Xem & Sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingAccount(row);
                                toast.info("Đã mở modal đặt lại mật khẩu.");
                              }}
                              className="cursor-pointer text-xs font-semibold"
                            >
                              <Key className="mr-2 h-3.5 w-3.5 text-amber-500" /> Reset Mật khẩu
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toast.success(`Đã đổi trạng thái tài khoản ${row.username}`)}
                              className="cursor-pointer text-xs font-semibold text-amber-600"
                            >
                              <Lock className="mr-2 h-3.5 w-3.5" /> Tạm khóa
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(row)} className="text-red-600 cursor-pointer text-xs font-semibold">
                              <Trash2 className="mr-2 h-3.5 w-3.5" /> Xóa tài khoản
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
      </Tabs>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[520px] rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-[#0b101e]">
          <div className="bg-slate-50/80 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">Thêm tài khoản mới</DialogTitle>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400">Họ và tên</label>
              <Input
                className="rounded-xl"
                placeholder="Nguyễn Văn A"
                value={newAccount.name}
                onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400">Username *</label>
                <Input
                  className="rounded-xl"
                  placeholder="nguyenvana"
                  value={newAccount.username}
                  onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400">Vai trò</label>
                <Select
                  value={newAccount.role}
                  onValueChange={(val) => setNewAccount({ ...newAccount, role: val as AccountRole })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="STUDENT">Học viên</SelectItem>
                    <SelectItem value="TEACHER">Giảng viên</SelectItem>
                    <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                    <SelectItem value="USER">Người dùng vãng lai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400">Email *</label>
                <Input
                  className="rounded-xl"
                  placeholder="hocvien@gmail.com"
                  value={newAccount.email}
                  onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400">Số điện thoại</label>
                <Input
                  className="rounded-xl"
                  placeholder="0912345678"
                  value={newAccount.phone || ""}
                  onChange={(e) => setNewAccount({ ...newAccount, phone: e.target.value })}
                />
              </div>
            </div>
            {newAccount.role === "STUDENT" && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-orange flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" /> Thời hạn khóa học & Xếp lớp
                </p>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Xếp vào Lớp học</label>
                  <Select
                    value={newAccount.classSectionId || ""}
                    onValueChange={(val) => setNewAccount({ ...newAccount, classSectionId: val })}
                  >
                    <SelectTrigger className="rounded-xl bg-white dark:bg-slate-900">
                      <SelectValue placeholder="-- Chọn lớp học --" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {classList.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} ({c.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ngày nhập học</label>
                    <Input
                      type="date"
                      className="rounded-xl bg-white dark:bg-slate-900"
                      value={newAccount.startDate || ""}
                      onChange={(e) => setNewAccount({ ...newAccount, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ngày hết hạn</label>
                    <Input
                      type="date"
                      className="rounded-xl bg-white dark:bg-slate-900"
                      value={newAccount.endDate || ""}
                      onChange={(e) => setNewAccount({ ...newAccount, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)} className="rounded-xl">
              Hủy
            </Button>
            <Button onClick={handleCreateAccount} className="rounded-xl bg-orange text-white">
              Tạo tài khoản
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editingAccount !== null} onOpenChange={(open) => !open && setEditingAccount(null)}>
        <DialogContent className="sm:max-w-[520px] rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-[#0b101e]">
          <div className="bg-slate-50/80 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">Chỉnh sửa & Reset Mật khẩu</DialogTitle>
          </div>
          {editingAccount && (
            <div className="px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400">Họ và tên</label>
                <Input
                  className="rounded-xl"
                  value={editingAccount.name}
                  onChange={(e) => setEditingAccount({ ...editingAccount, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400">Username</label>
                  <Input
                    className="rounded-xl"
                    value={editingAccount.username}
                    onChange={(e) => setEditingAccount({ ...editingAccount, username: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400">Vai trò</label>
                  <Select
                    value={editingAccount.role}
                    onValueChange={(val) => setEditingAccount({ ...editingAccount, role: val as AccountRole })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="STUDENT">Học viên</SelectItem>
                      <SelectItem value="TEACHER">Giảng viên</SelectItem>
                      <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                      <SelectItem value="USER">Người dùng vãng lai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400">Email</label>
                  <Input
                    className="rounded-xl"
                    value={editingAccount.email}
                    onChange={(e) => setEditingAccount({ ...editingAccount, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400">Số điện thoại</label>
                  <Input
                    className="rounded-xl"
                    value={editingAccount.phone || ""}
                    onChange={(e) => setEditingAccount({ ...editingAccount, phone: e.target.value })}
                  />
                </div>
              </div>

              {editingAccount.role === "STUDENT" && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-orange flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" /> Thời hạn khóa học & Xếp lớp (Chỉ chọn Ngày)
                  </p>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Xếp vào Lớp học</label>
                    <Select
                      value={editingAccount.classSectionId || editingAccount.enrollments?.[0]?.classSection?.id || ""}
                      onValueChange={(val) => setEditingAccount({ ...editingAccount, classSectionId: val })}
                    >
                      <SelectTrigger className="rounded-xl bg-white dark:bg-slate-900">
                        <SelectValue placeholder="-- Chọn lớp học --" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {classList.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name} ({c.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ngày nhập học</label>
                      <Input
                        type="date"
                        className="rounded-xl bg-white dark:bg-slate-900"
                        value={
                          formatDateForInput(
                            editingAccount.startDate ||
                            editingAccount.enrollments?.[0]?.classSection?.startAt ||
                            ""
                          )
                        }
                        onChange={(e) => setEditingAccount({ ...editingAccount, startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ngày hết hạn</label>
                      <Input
                        type="date"
                        className="rounded-xl bg-white dark:bg-slate-900"
                        value={
                          formatDateForInput(
                            editingAccount.endDate ||
                            editingAccount.enrollments?.[0]?.classSection?.endAt ||
                            ""
                          )
                        }
                        onChange={(e) => setEditingAccount({ ...editingAccount, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setEditingAccount(null)} className="rounded-xl">
              Hủy
            </Button>
            <Button onClick={handleEditSave} className="rounded-xl bg-orange text-white">
              Lưu thay đổi
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Import */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-[#0b101e]">
          <div className="bg-slate-50/80 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">Nhập danh sách tài khoản</DialogTitle>
            <Button size="sm" variant="outline" onClick={handleDownloadSample} className="h-8 text-xs gap-1 rounded-lg border-slate-300">
              <Download className="h-3.5 w-3.5 text-emerald-600" /> Tải file Excel mẫu (.xlsx)
            </Button>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Direct File Upload Option */}
            <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col items-center justify-center text-center space-y-2">
              <Upload className="h-8 w-8 text-orange" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Chọn file Excel (.xlsx, .xls, .csv) từ máy tính</p>
                <p className="text-[11px] text-slate-400">Định dạng ngày hỗ trợ: <strong>dd/mm/yyyy</strong> hoặc <strong>yyyy-mm-dd</strong></p>
              </div>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                id="excel-file-upload"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs rounded-lg font-bold"
                onClick={() => document.getElementById("excel-file-upload")?.click()}
              >
                Tải lên File Excel
              </Button>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              <span className="bg-white dark:bg-[#0b101e] px-3 text-[11px] font-bold text-slate-400 uppercase">Hoặc dán thủ công</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <p className="font-semibold text-slate-900 dark:text-slate-200">Định dạng mẫu các cột (phân cách bằng dấu phẩy , hoặc phẩy phẩy ;):</p>
              <code className="block font-mono bg-white dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800 text-orange">
                Họ tên, Username, Email, Phone, Role, Password, ID_Lớp, NgàyBD (dd/mm/yyyy), NgàyKT (dd/mm/yyyy)
              </code>
            </div>

            <Textarea
              rows={6}
              placeholder={`Nguyễn Văn A, nguyenvana, a@gmail.com, 0987654321, STUDENT, 123456,, 01/01/2026, 01/07/2026\nTrần Thị B, tranthib, b@gmail.com, 0912345678, STUDENT, 123456,, 15/02/2026, 15/08/2026`}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              className="rounded-xl font-mono text-xs"
            />
          </div>

          <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsImportModalOpen(false)} className="rounded-xl">
              Hủy
            </Button>
            <Button onClick={handleImportRows} className="rounded-xl bg-orange text-white">
              Tiến hành nhập
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}