"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageIcon, Upload, X, ExternalLink } from "lucide-react";
import { IImage } from "@/types/product";
import { uploadFile } from "@/lib/actions/upload";
import { saveImage } from "@/lib/actions/product";

interface ImageUploadProps {
  onImageSelect: (image: { id: string; url: string }) => void;
  onImageRemove: () => void;
  selectedImage: { id: string; url: string } | null;
}

export function ImageUpload({
  onImageSelect,
  onImageRemove,
  selectedImage,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadFile(formData);

      if (result.success && result.data) {
        // Create image payload for Supabase
        const imagePayload: Partial<IImage> = {
          filename: result.data.fileName,
          backblaze_url: result.data.downloadUrl,
          backblaze_key: result.data.backblazeKey,
          alt_text: result.data.altText,
          file_size: result.data.fileSize,
          mime_type: result.data.mimeType,
          context: "both",
        };

        // Save image to Supabase
        const createImageResult = await saveImage(imagePayload);

        if (createImageResult.success && createImageResult.data) {
          onImageSelect({
            id: createImageResult.data.id,
            url: createImageResult.data.backblaze_url,
          });
        } else {
          throw new Error(
            createImageResult.error || "Failed to save image to database"
          );
        }
      } else {
        throw new Error(result.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset input
    event.target.value = "";
  };

  return (
    <div className="space-y-4">
      {selectedImage ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                  <Image
                    src={selectedImage.url}
                    alt="Selected image"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">Image Selected</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedImage.id}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(selectedImage.url, "_blank")}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={onImageRemove}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card
          className={`border-2 border-dashed transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 rounded-full bg-muted">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium">
                  {uploading ? "Uploading..." : "Upload an image"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Drag and drop an image here, or click to select
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("file-input")?.click()}
                  disabled={uploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
