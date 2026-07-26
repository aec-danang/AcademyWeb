"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CalendarDays, ArrowRight, BookOpen, ChevronDown, Loader2 } from "lucide-react";

type Post = {
  slug: string;
  title: string;
  excerpt: string | null;
  featuredImage: string | null;
  createdAt: string;
};

const BATCH = 6;

export default function BlogListClient({ posts }: { posts: Post[] }) {
  const [visible, setVisible] = useState(BATCH);
  const [loading, setLoading] = useState(false);

  const shown = posts.slice(0, visible);
  const hasMore = visible < posts.length;

  const handleLoadMore = () => {
    setLoading(true);
    // Simulate a tiny delay so the spinner is visible on fast connections
    setTimeout(() => {
      setVisible((v) => v + BATCH);
      setLoading(false);
    }, 300);
  };

  if (posts.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-12 text-center max-w-2xl mx-auto border border-slate-200/60 dark:border-slate-800">
        <div className="w-20 h-20 bg-orange/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpen className="text-orange w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold text-navy dark:text-white mb-2">Chưa có bài viết nào</h3>
        <p className="text-slate-500 dark:text-slate-400">Chúng tôi đang chuẩn bị những bài viết thú vị. Vui lòng quay lại sau nhé!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {shown.map((post) => (
          <Link
            key={post.slug}
            href={`/posts/${post.slug}`}
            className="group flex flex-col lg:flex-row bg-white dark:bg-slate-900 rounded-2xl shadow-[0_8px_30px_rgba(44,45,101,0.06)] dark:shadow-none hover:shadow-[0_12px_40px_rgba(44,45,101,0.12)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:-translate-y-2 border border-slate-200/60 dark:border-slate-800 transition-all duration-300 overflow-hidden"
          >
            {post.featuredImage && (
              <div className="relative w-full lg:w-2/5 h-56 lg:h-auto overflow-hidden shrink-0">
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  style={{ objectFit: "cover" }}
                  className="group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}
            <div className="p-8 lg:p-10 flex flex-col justify-center flex-grow">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4 font-semibold">
                <CalendarDays size={16} />
                <span>{new Date(post.createdAt).toLocaleDateString("vi-VN")}</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-navy dark:text-slate-100 group-hover:text-orange transition-colors line-clamp-2">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-slate-600 dark:text-slate-400 mb-8 line-clamp-3 lg:line-clamp-2 text-sm leading-relaxed">
                  {post.excerpt}
                </p>
              )}
              <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center font-bold text-navy dark:text-slate-200 group-hover:text-orange text-sm uppercase tracking-wider transition-colors">
                Xem chi tiết
                <span className="ml-auto w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-orange group-hover:text-white transition-colors">
                  <ArrowRight size={18} />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="mt-16 flex flex-col items-center gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Hiển thị {shown.length} / {posts.length} bài viết
          </p>
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ChevronDown size={18} />
            )}
            {loading ? "Đang tải..." : "Xem thêm bài viết"}
          </button>
        </div>
      )}
    </>
  );
}
