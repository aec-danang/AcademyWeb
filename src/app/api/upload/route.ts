import { NextResponse } from "next/server";
import { storageService } from "@/lib/storage/storage.service";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "academy_media";

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
