export type StorageFolder = 'courses' | 'teachers' | 'blog' | 'ui' | 'student_life' | 'academy_media';

export interface UploadOptions {
  folder?: StorageFolder;
  publicId?: string;
  tags?: string[];
}

export interface UploadResult {
  publicId: string;
  secureUrl: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
  folder?: string;
  provider: string;
}

export interface StorageProvider {
  upload(fileBuffer: Buffer, options?: UploadOptions): Promise<UploadResult>;
  delete(publicId: string): Promise<boolean>;
  getOptimizedUrl(publicIdOrUrl: string): string;
}
