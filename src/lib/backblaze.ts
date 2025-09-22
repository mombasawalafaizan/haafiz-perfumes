import B2 from "backblaze-b2";
import { createHash } from "crypto";

// Types for our image upload functionality
export interface ImageUploadOptions {
  file: Buffer;
  filename: string;
  mimeType?: string;
  altText?: string;
  context?: "product" | "variant" | "both";
  onProgress?: (progress: number) => void;
}

export interface ImageUploadResult {
  fileId: string;
  fileName: string;
  downloadUrl: string;
  backblazeKey: string;
  fileSize: number;
  mimeType: string;
  altText: string;
  context: "product" | "variant" | "both";
}

export interface B2Config {
  applicationKeyId: string;
  applicationKey: string;
  bucketId: string;
  bucketName: string;
}

class BackblazeService {
  private b2: B2;
  private bucketId: string;
  private bucketName: string;
  private isAuthorized: boolean = false;

  constructor(config: B2Config) {
    this.b2 = new B2({
      applicationKeyId: config.applicationKeyId,
      applicationKey: config.applicationKey,
      retry: {
        retries: 3,
        retryDelay: (retryCount) => Math.pow(2, retryCount) * 1000, // Exponential backoff
      },
    });

    this.bucketId = config.bucketId;
    this.bucketName = config.bucketName;
  }

  /**
   * Authorize with Backblaze B2 (required before any operations)
   */
  private async authorize(): Promise<void> {
    if (this.isAuthorized) return;

    try {
      await this.b2.authorize();
      this.isAuthorized = true;
    } catch (error) {
      console.error("Failed to authorize with Backblaze B2:", error);
      throw new Error("Backblaze B2 authorization failed");
    }
  }

  /**
   * Generate a unique filename with timestamp and random string
   */
  private generateUniqueFilename(originalFilename: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = originalFilename.split(".").pop();
    return `${timestamp}-${randomString}.${extension}`;
  }

  /**
   * Calculate SHA1 hash of file data
   */
  private calculateSHA1(data: Buffer): string {
    return createHash("sha1").update(data).digest("hex");
  }

  /**
   * Upload a single image file to Backblaze B2
   */
  async uploadImage(options: ImageUploadOptions): Promise<ImageUploadResult> {
    try {
      await this.authorize();

      // Generate unique filename
      const uniqueFilename = this.generateUniqueFilename(options.filename);

      // Get upload URL and auth token
      const uploadUrlResponse = await this.b2.getUploadUrl({
        bucketId: this.bucketId,
      });

      const { uploadUrl, authorizationToken } = uploadUrlResponse.data;

      // Calculate file hash
      const fileHash = this.calculateSHA1(options.file);

      // Upload the file
      const uploadResponse = await this.b2.uploadFile({
        uploadUrl,
        uploadAuthToken: authorizationToken,
        fileName: uniqueFilename,
        data: options.file,
        contentLength: options.file.length,
        mime: options.mimeType || "image/jpeg",
        hash: fileHash,
        info: {
          "original-filename": options.filename,
          "alt-text": options.altText || "",
          context: options.context || "both",
        },
        onUploadProgress: options.onProgress
          ? (event) => {
              const progress = Math.round((event.loaded / event.total) * 100);
              options.onProgress!(progress);
            }
          : undefined,
      });

      const { fileId, fileName, contentLength, contentType } =
        uploadResponse.data;

      // Construct download URL
      const downloadUrl = `https://f004.backblazeb2.com/file/${this.bucketName}/${fileName}`;

      return {
        fileId,
        fileName,
        downloadUrl,
        backblazeKey: fileId, // In B2, the key is the fileId
        fileSize: contentLength,
        mimeType: contentType,
        altText: options.altText ?? options.filename ?? uniqueFilename,
        context: options.context ?? "both",
      };
    } catch (error) {
      console.error("Failed to upload image to Backblaze B2:", error);
      throw new Error(
        `Image upload failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Upload multiple images in parallel
   */
  async uploadMultipleImages(
    images: ImageUploadOptions[],
    onProgress?: (completed: number, total: number) => void
  ): Promise<ImageUploadResult[]> {
    const results: ImageUploadResult[] = [];
    let completed = 0;

    // Process images in batches to avoid overwhelming the API
    const batchSize = 3;
    for (let i = 0; i < images.length; i += batchSize) {
      const batch = images.slice(i, i + batchSize);

      const batchPromises = batch.map(async (image) => {
        const result = await this.uploadImage(image);
        completed++;
        onProgress?.(completed, images.length);
        return result;
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Delete a file from Backblaze B2
   */
  async deleteFile(fileId: string, fileName: string): Promise<void> {
    try {
      await this.authorize();

      await this.b2.deleteFileVersion({
        fileId,
        fileName,
      });
    } catch (error) {
      console.error("Failed to delete file from Backblaze B2:", error);
      throw new Error(
        `File deletion failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get file information
   */
  async getFileInfo(fileId: string): Promise<any> {
    try {
      await this.authorize();

      const response = await this.b2.getFileInfo({ fileId });
      return response.data;
    } catch (error) {
      console.error("Failed to get file info from Backblaze B2:", error);
      throw new Error(
        `Get file info failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * List files in the bucket
   */
  async listFiles(prefix?: string, maxCount: number = 100): Promise<any[]> {
    try {
      await this.authorize();

      const response = await this.b2.listFileNames({
        bucketId: this.bucketId,
        prefix: prefix || "",
        maxFileCount: maxCount,
      });

      return response.data.files;
    } catch (error) {
      console.error("Failed to list files from Backblaze B2:", error);
      throw new Error(
        `List files failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Download a file by name
   */
  async downloadFile(fileName: string): Promise<Buffer> {
    try {
      await this.authorize();

      const response = await this.b2.downloadFileByName({
        bucketName: this.bucketName,
        fileName,
        responseType: "arraybuffer",
      });

      return Buffer.from(response.data);
    } catch (error) {
      console.error("Failed to download file from Backblaze B2:", error);
      throw new Error(
        `File download failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}

// Create and export a singleton instance
// You'll need to set these environment variables in your .env.local file
const backblazeConfig: B2Config = {
  applicationKeyId: process.env.BACKBLAZE_APPLICATION_KEY_ID!,
  applicationKey: process.env.BACKBLAZE_APPLICATION_KEY!,
  bucketId: process.env.BACKBLAZE_BUCKET_ID!,
  bucketName: process.env.BACKBLAZE_BUCKET_NAME!,
};

// Validate required environment variables
const requiredEnvVars = [
  "BACKBLAZE_APPLICATION_KEY_ID",
  "BACKBLAZE_APPLICATION_KEY",
  "BACKBLAZE_BUCKET_ID",
  "BACKBLAZE_BUCKET_NAME",
];

const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  console.warn(
    `Missing Backblaze environment variables: ${missingEnvVars.join(", ")}`
  );
  console.warn("Please add these to your .env.local file");
}

export const backblazeService = new BackblazeService(backblazeConfig);

// Export the class for custom instances if needed
export { BackblazeService };

// Utility functions for common operations
export const uploadImageToBackblaze = (options: ImageUploadOptions) =>
  backblazeService.uploadImage(options);

export const uploadMultipleImagesToBackblaze = (
  images: ImageUploadOptions[],
  onProgress?: (completed: number, total: number) => void
) => backblazeService.uploadMultipleImages(images, onProgress);

export const deleteImageFromBackblaze = (fileId: string, fileName: string) =>
  backblazeService.deleteFile(fileId, fileName);

export const getImageFromBackblaze = (fileName: string) =>
  backblazeService.downloadFile(fileName);
