import { NextResponse } from "next/server";
import { storageService } from "@/lib/storage/storage.service";
import { StorageFolder } from "@/lib/storage/types";

const ALLOWED_FOLDERS: StorageFolder[] = ["courses", "teachers", "blog", "ui", "student_life", "academy_media"];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folderInput = formData.get("folder") as string;
    
    let folder: StorageFolder = "academy_media";
    if (folderInput) {
      if (ALLOWED_FOLDERS.includes(folderInput as StorageFolder)) {
        folder = folderInput as StorageFolder;
      } else {
        return NextResponse.json({ error: `Invalid folder. Allowed: ${ALLOWED_FOLDERS.join(", ")}` }, { status: 400 });
      }
    }

    if (!file) {
      return NextResponse.json({ error: "Không tìm thấy file tải lên" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary & Save metadata to Neon DB Media
    const media = await storageService.uploadAndSaveMedia(buffer, { folder });

    return NextResponse.json({
      mediaId: media.id,
      secureUrl: media.secureUrl,
      publicId: media.publicId,
      width: media.width,
      height: media.height,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Lỗi tải ảnh lên Cloudinary" }, { status: 500 });
  }
}
