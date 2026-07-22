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
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-orange-light rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpen className="text-orange w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold text-navy mb-2 font-montserrat">Chưa có bài viết nào</h3>
        <p className="text-navy/60">Chúng tôi đang chuẩn bị những bài viết thú vị. Vui lòng quay lại sau nhé!</p>
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
            className="group flex flex-col lg:flex-row bg-white rounded-2xl shadow-sm hover:shadow-card transition-all duration-300 overflow-hidden border border-gray-100"
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
            <div className="p-6 lg:p-8 flex flex-col justify-center flex-grow">
              <div className="flex items-center gap-2 text-sm text-navy/50 mb-3 font-semibold">
                <CalendarDays size={16} />
                <span>{new Date(post.createdAt).toLocaleDateString("vi-VN")}</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-navy group-hover:text-orange transition-colors line-clamp-2 font-montserrat">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-navy/70 mb-4 line-clamp-3 lg:line-clamp-2 text-sm leading-relaxed">
                  {post.excerpt}
                </p>
              )}
              <div className="mt-auto flex items-center font-bold text-orange text-sm tracking-wider uppercase transition-all">
                Xem chi tiết{" "}
                <ArrowRight size={16} className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="mt-12 flex flex-col items-center gap-3">
          <p className="text-sm text-navy/50 font-medium">
            Hiển thị {shown.length} / {posts.length} bài viết
          </p>
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full border-2 border-orange text-orange font-bold hover:bg-orange hover:text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
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
