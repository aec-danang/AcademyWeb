"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Monitor, Tablet, Smartphone, X } from "lucide-react";

interface DevicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  featuredImage?: string;
}

export function DevicePreviewModal({ isOpen, onClose, title, content, featuredImage }: DevicePreviewModalProps) {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const getDeviceWidth = () => {
    switch (device) {
      case "mobile": return "w-[375px] h-[667px]";
      case "tablet": return "w-[768px] h-[900px]";
      case "desktop": default: return "w-full max-w-4xl h-full";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 flex flex-col gap-0 rounded-2xl overflow-hidden bg-slate-900 border-slate-800">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-950 border-b border-slate-800 text-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">Xem trước giao diện thực tế</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <Button
              size="sm"
              variant={device === "desktop" ? "secondary" : "ghost"}
              onClick={() => setDevice("desktop")}
              className="h-8 px-3 text-xs gap-1.5 cursor-pointer"
            >
              <Monitor className="h-4 w-4" />
              <span>Máy tính</span>
            </Button>
            <Button
              size="sm"
              variant={device === "tablet" ? "secondary" : "ghost"}
              onClick={() => setDevice("tablet")}
              className="h-8 px-3 text-xs gap-1.5 cursor-pointer"
            >
              <Tablet className="h-4 w-4" />
              <span>Máy tính bảng</span>
            </Button>
            <Button
              size="sm"
              variant={device === "mobile" ? "secondary" : "ghost"}
              onClick={() => setDevice("mobile")}
              className="h-8 px-3 text-xs gap-1.5 cursor-pointer"
            >
              <Smartphone className="h-4 w-4" />
              <span>Điện thoại</span>
            </Button>
          </div>

          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Viewport Frame Container */}
        <div className="flex-1 bg-slate-900/50 p-6 flex justify-center items-center overflow-auto">
          <div className={`bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl overflow-y-auto border border-slate-800 transition-all duration-300 ${getDeviceWidth()}`}>
            <div className="p-8 md:p-12 space-y-6">
              {featuredImage && (
                <div className="rounded-xl overflow-hidden aspect-video bg-slate-100 dark:bg-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={featuredImage} alt={title} className="w-full h-full object-cover" />
                </div>
              )}
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{title || "Untitled Post"}</h1>
              <div 
                className="prose dark:prose-invert max-w-none text-base leading-relaxed"
                dangerouslySetInnerHTML={{ __html: content || "<p className='text-slate-400 italic'>No content to preview...</p>" }}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
