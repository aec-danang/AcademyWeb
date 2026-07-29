import { prisma } from "@/lib/prisma";
import { cloudinaryProvider } from "./cloudinary.provider";
import { StorageProvider, UploadOptions, UploadResult } from "./types";

export class StorageService {
  private provider: StorageProvider;

  constructor(provider: StorageProvider = cloudinaryProvider) {
    this.provider = provider;
  }

  async uploadAndSaveMedia(fileBuffer: Buffer, options?: UploadOptions) {
    // 1. Upload to Cloudinary with f_auto, q_auto
    const result: UploadResult = await this.provider.upload(fileBuffer, options);

    // 2. Save metadata to Neon DB Media table
    const media = await prisma.media.upsert({
      where: { publicId: result.publicId },
      update: {
        secureUrl: result.secureUrl,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        format: result.format,
        updatedAt: new Date(),
      },
      create: {
        provider: result.provider,
        publicId: result.publicId,
        secureUrl: result.secureUrl,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        format: result.format,
        folder: result.folder,
      },
    });

    return media;
  }

  async deleteMedia(mediaIdOrPublicId: string) {
    // Find in DB first
    const media = await prisma.media.findFirst({
      where: {
        OR: [{ id: mediaIdOrPublicId }, { publicId: mediaIdOrPublicId }],
      },
    });

    if (media) {
      // Delete from Cloudinary
      await this.provider.delete(media.publicId);
      // Delete from DB
      await prisma.media.delete({ where: { id: media.id } });
      return true;
    }

    // Direct deletion by publicId if not in DB
    return await this.provider.delete(mediaIdOrPublicId);
  }

  getOptimizedUrl(urlOrPublicId: string) {
    return this.provider.getOptimizedUrl(urlOrPublicId);
  }
}

export const storageService = new StorageService();
