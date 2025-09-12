"use server";

import { uploadImageToBackblaze } from "@/lib/backblaze";

export async function uploadFile(formData: FormData) {
  try {
    const file = formData.get("file") as File;

    if (!file) {
      return {
        success: false,
        error: "No file provided",
      };
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Backblaze
    const result = await uploadImageToBackblaze({
      file: buffer,
      filename: file.name,
      mimeType: file.type,
      altText: `Uploaded image: ${file.name}`,
      context: "product",
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: "Upload failed",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
