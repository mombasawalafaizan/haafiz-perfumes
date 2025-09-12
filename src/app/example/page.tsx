"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploadResult } from "@/lib/backblaze";
import { Upload, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { uploadFile } from "@/lib/actions/upload";

export default function ExamplePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<ImageUploadResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
      setError(null);
      setProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Create FormData for the server action
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Upload via server action
      const result = await uploadFile(formData);

      if (!result.success) {
        throw new Error(result.error || "Upload failed");
      }

      setUploadResult(result.data ?? null);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setError(null);
    setProgress(0);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Backblaze Image Upload Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Selection */}
          <div className="space-y-2">
            <label htmlFor="file-input" className="text-sm font-medium">
              Select Image File
            </label>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              disabled={uploading}
            />
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm">
                <strong>Selected:</strong> {selectedFile.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <p className="text-sm text-muted-foreground">
                Type: {selectedFile.type}
              </p>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Uploading... {progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload to Backblaze
              </>
            )}
          </Button>

          {/* Success Result */}
          {uploadResult && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-medium text-green-800">
                  Upload Successful!
                </h3>
              </div>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>File ID:</strong> {uploadResult.fileId}
                </p>
                <p>
                  <strong>File Name:</strong> {uploadResult.fileName}
                </p>
                <p>
                  <strong>File Size:</strong>{" "}
                  {(uploadResult.fileSize / 1024 / 1024).toFixed(2)} MB
                </p>
                <p>
                  <strong>MIME Type:</strong> {uploadResult.mimeType}
                </p>
                <p>
                  <strong>Download URL:</strong>{" "}
                  <a
                    href={uploadResult.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {uploadResult.downloadUrl}
                  </a>
                </p>
              </div>
            </div>
          )}

          {/* Error Result */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <h3 className="font-medium text-red-800">Upload Failed</h3>
              </div>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Reset Button */}
          {(uploadResult || error) && (
            <Button onClick={resetUpload} variant="outline" className="w-full">
              Upload Another Image
            </Button>
          )}

          {/* Instructions */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="font-medium text-blue-800 mb-2">Instructions:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Select an image file (JPG, PNG, etc.)</li>
              <li>
                • Click &quot;Upload to Backblaze&quot; to test the upload
              </li>
              <li>• Monitor the progress bar during upload</li>
              <li>• View the upload result and download URL</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
