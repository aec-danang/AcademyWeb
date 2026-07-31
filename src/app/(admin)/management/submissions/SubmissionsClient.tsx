"use client";

import { useState } from "react";
import { updateSubmissionStatus, deleteSubmission } from "./actions";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

type ContactSubmission = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  status: string;
  createdAt: Date;
};

export default function SubmissionsClient({ initialSubmissions }: { initialSubmissions: ContactSubmission[] }) {
  const [submissions, setSubmissions] = useState(initialSubmissions);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateSubmissionStatus(id, newStatus);
      setSubmissions(submissions.map(s => s.id === id ? { ...s, status: newStatus } : s));
      toast.success(`Đã cập nhật trạng thái liên hệ`);
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đăng ký tư vấn này?")) return;
    try {
      await deleteSubmission(id);
      setSubmissions(submissions.filter(s => s.id !== id));
      toast.success("Đã xóa đăng ký tư vấn");
    } catch (error) {
      toast.error("Không thể xóa thông tin này");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-navy dark:text-white">Đăng ký tư vấn & Liên hệ</h1>
          <p className="text-slate-500 dark:text-slate-400">Xem và quản lý danh sách phụ huynh, học viên đăng ký tư vấn từ website</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Họ tên</th>
                <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Thông tin liên hệ</th>
                <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Khóa học quan tâm / Lời nhắn</th>
                <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Ngày gửi</th>
                <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Trạng thái</th>
                <th className="p-4 font-medium text-slate-500 dark:text-slate-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Chưa có đăng ký tư vấn nào.
                  </td>
                </tr>
              ) : (
                submissions.map((submission) => (
                  <tr key={submission.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-medium text-navy dark:text-slate-200">{submission.name}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      <div>{submission.phone}</div>
                      {submission.email && <div className="text-sm">{submission.email}</div>}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {submission.message?.replace("Interested in: ", "Quan tâm: ")}
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 text-sm" suppressHydrationWarning>
                      {new Date(submission.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        submission.status === 'contacted' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {submission.status === 'contacted' ? 'Đã liên hệ' : 'Mới'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {submission.status === 'new' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleStatusChange(submission.id, 'contacted')}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 h-8 px-2.5 text-xs font-semibold"
                            title="Đánh dấu đã liên hệ"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Đã tư vấn
                          </Button>
                        )}
                        {submission.status === 'contacted' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleStatusChange(submission.id, 'new')}
                            className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 h-8 px-2.5 text-xs font-semibold"
                            title="Đánh dấu chờ xử lý"
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Chưa tư vấn
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(submission.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 px-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
