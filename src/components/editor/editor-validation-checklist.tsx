"use client";

import React from "react";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface ValidationChecklistProps {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  metaDescription?: string;
}

export function ValidationChecklist({ title, slug, content, excerpt, featuredImage, metaDescription }: ValidationChecklistProps) {
  const checks = [
    { label: "Đã nhập Tiêu đề bài viết", ok: !!title.trim() && title.length >= 5 },
    { label: "Đường dẫn URL (Slug) hợp lệ", ok: !!slug.trim() && /^[a-z0-9-]+$/.test(slug) },
    { label: "Nội dung đạt độ dài tối thiểu", ok: !!content.trim() && content.replace(/<[^>]*>/g, '').trim().length >= 50 },
    { label: "Đã có Ảnh đại diện", ok: !!featuredImage?.trim() },
    { label: "Có Tóm tắt nội dung", ok: !!excerpt?.trim() },
    { label: "Mô tả SEO (Meta Description)", ok: !!metaDescription?.trim() && metaDescription.length >= 50 && metaDescription.length <= 160 },
  ];

  const totalOk = checks.filter(c => c.ok).length;

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tiêu chuẩn Xuất bản</span>
        <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${totalOk === checks.length ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-orange/20 text-orange dark:text-orange-400'}`}>
          {totalOk} / {checks.length} Đạt
        </span>
      </div>

      <div className="space-y-1.5 pt-1">
        {checks.map((c, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className={c.ok ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-500"}>
              {c.label}
            </span>
            {c.ok ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
