import { v2 as cloudinary } from "cloudinary";
import { StorageProvider, UploadOptions, UploadResult } from "./types";

export class CloudinaryStorageProvider implements StorageProvider {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "nc7qd859",
      api_key: process.env.CLOUDINARY_API_KEY || "915659763844291",
      api_secret: process.env.CLOUDINARY_API_SECRET || "v45YojgDK2Tw5jZpXeAbi3_sikg",
      secure: true,
    });
  }

  async upload(fileBuffer: Buffer, options?: UploadOptions): Promise<UploadResult> {
    const folder = options?.folder || "academy_media";
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: options?.publicId,
          tags: options?.tags,
          resource_type: "auto",
          transformation: [{ fetch_format: "auto", quality: "auto" }],
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error("Upload failed with no result"));
          }

          // Force f_auto,q_auto in URL if not present
          let url = result.secure_url;
          if (url.includes("/upload/") && !url.includes("/f_auto,q_auto/")) {
            url = url.replace("/upload/", "/upload/f_auto,q_auto/");
          }

          resolve({
            publicId: result.public_id,
            secureUrl: url,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            format: result.format,
            folder,
            provider: "cloudinary",
          });
        }
      );
      uploadStream.end(fileBuffer);
    });
  }

  async delete(publicId: string): Promise<boolean> {
    try {
      const res = await cloudinary.uploader.destroy(publicId);
      return res.result === "ok" || res.result === "not found";
    } catch {
      return false;
    }
  }

  getOptimizedUrl(publicIdOrUrl: string): string {
    if (publicIdOrUrl.startsWith("http")) {
      if (publicIdOrUrl.includes("res.cloudinary.com") && publicIdOrUrl.includes("/upload/") && !publicIdOrUrl.includes("/f_auto,q_auto/")) {
        return publicIdOrUrl.replace("/upload/", "/upload/f_auto,q_auto/");
      }
      return publicIdOrUrl;
    }
    return cloudinary.url(publicIdOrUrl, {
      fetch_format: "auto",
      quality: "auto",
      secure: true,
    });
  }
}

export const cloudinaryProvider = new CloudinaryStorageProvider();
