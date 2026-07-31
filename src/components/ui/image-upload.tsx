"use client";

import React, { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { ImagePlus, Loader2, X } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onUpload = (result: any) => {
    setIsUploading(false);
    if (result.info && typeof result.info === 'object' && 'secure_url' in result.info) {
      onChange(result.info.secure_url);
    }
  };

  if (value) {
    return (
      <div className="relative border-2 border-slate-200 rounded-lg p-2 h-40 w-full overflow-hidden flex items-center justify-center group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value} alt="Uploaded image" className="object-cover w-full h-full rounded-md" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
           <button
            type="button"
            onClick={() => onChange("")}
            className="bg-rose-500 text-white p-2 rounded-full shadow-sm hover:bg-rose-600 transition-colors"
           >
            <X className="h-5 w-5" />
           </button>
        </div>
      </div>
    );
  }

  return (
    <CldUploadWidget 
      onUploadAdded={() => setIsUploading(true)}
      onSuccess={onUpload}
      onError={() => setIsUploading(false)}
      onClose={() => setIsUploading(false)}
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "unsigned_preset"}
      options={{
        maxFiles: 1,
        resourceType: "image"
      }}
    >
      {({ open }) => {
        const onClick = (e: React.MouseEvent) => {
          e.preventDefault();
          open();
        };

        return (
          <div 
            onClick={!disabled && !isUploading ? onClick : undefined}
            className={`border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors h-40 w-full ${disabled || isUploading ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'cursor-pointer bg-slate-50 hover:bg-slate-100'}`}
          >
            {isUploading ? (
              <Loader2 className="h-6 w-6 text-slate-400 mb-2 animate-spin" />
            ) : (
              <ImagePlus className="h-6 w-6 text-slate-400 mb-2" />
            )}
            <p className="text-sm font-medium text-slate-900">
              {isUploading ? "Uploading..." : "Click to upload an image"}
            </p>
          </div>
        );
      }}
    </CldUploadWidget>
  );
}
