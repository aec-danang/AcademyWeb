"use client";

import { useState, useRef } from "react";
import { Plus, Image as ImageIcon, Trash2, UploadCloud, X, Loader2 } from "lucide-react";
import { createStudentLifeEvent, deleteStudentLifeEvent } from "@/lib/mediaActions";
import { useRouter } from "next/navigation";

type StudentLifeEvent = {
  id: string;
  title: string;
  imageUrl: string;
  order: number;
};

export function MediaManager({ initialEvents }: { initialEvents: StudentLifeEvent[] }) {
  const [events, setEvents] = useState<StudentLifeEvent[]>(initialEvents);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!newTitle) {
      alert("Vui lòng nhập tên sự kiện trước khi tải ảnh lên!");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "student_life");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Lỗi tải ảnh lên Cloudinary!");
      }

      const secureUrl = data.secureUrl;
      if (secureUrl) {
        // Save to Database
        const newOrder = events.length > 0 ? Math.max(...events.map(e => e.order)) + 1 : 0;
        const savedEvent = await createStudentLifeEvent(newTitle, secureUrl, newOrder);
        setEvents([...events, savedEvent]);
        setIsModalOpen(false);
        setNewTitle("");
        router.refresh();
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Có lỗi xảy ra khi tải ảnh.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa ảnh này? Nó sẽ biến mất khỏi trang chủ.")) return;
    try {
      await deleteStudentLifeEvent(id);
      setEvents(events.filter(e => e.id !== id));
      router.refresh();
    } catch (error) {
      alert("Lỗi khi xóa ảnh.");
    }
  };

  return (
    <div className="space-y-6 max-w-[1240px] mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Thư viện Media</h2>
          <p className="text-sm text-slate-500 mt-1">Quản lý hình ảnh "Student Life" hiển thị trên Landing Page.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> Thêm hình ảnh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm group relative">
            <div className="aspect-[4/3] w-full relative bg-slate-100 dark:bg-slate-800">
              <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
              <button 
                onClick={() => handleDelete(event.id)}
                className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-slate-900/90 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
              <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{event.title}</p>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <ImageIcon size={48} className="mb-4 text-slate-400" />
            <p className="font-semibold">Chưa có hình ảnh nào</p>
            <p className="text-sm">Hãy thêm hình ảnh để hiển thị lên phần Student Life.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden p-6 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Thêm hình ảnh mới</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tên sự kiện / Label</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Summer Camp 2026"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tải ảnh lên</label>
                <div 
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center text-blue-600">
                      <Loader2 className="w-8 h-8 animate-spin mb-2" />
                      <p className="text-sm font-medium">Đang tải lên Cloudinary...</p>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-sm font-semibold text-blue-600">Click để chọn ảnh từ máy</p>
                      <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP (Max 5MB)</p>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
