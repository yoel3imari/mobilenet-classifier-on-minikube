"use client";

import type React from "react";
import { useState, useRef } from "react";
import { X, Upload, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImagePreviewModal } from "./image-preview-modal";
import { useToast } from "@/hooks/use-toast";

interface Prediction {
  label: string;
  descrip: string;
  proba: number;
}

interface UploadedImage {
  id: string;
  url: string;
  name: string;
  file: File;
  status: 'pending' | 'completed' | 'error';
  predictions: Prediction[] | null;
  isUploading: boolean;
}


const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function ImageUploader() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    if (file.type !== "image/jpeg") {
      toast({
        title: "Unsupported file type",
        description: `${file.name} is not a JPEG image.`,
        variant: "destructive",
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: `${file.name} exceeds the maximum size of 5MB.`,
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result !== 'string') return;

      const newImage: UploadedImage = {
        id: crypto.randomUUID(),
        url: result,
        name: file.name,
        file,
        status: "pending",
        predictions: null,
        isUploading: false,
      };
      setImages((prev) => [...prev, newImage]);
    };
    reader.onerror = () => {
      toast({
        title: "Error reading file",
        description: `Failed to read ${file.name}`,
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (id: string) => setImages((prev) => prev.filter((img) => img.id !== id));
  const openFileInput = () => fileInputRef.current?.click();
  const openPreviewModal = (image: UploadedImage) => setSelectedImage(image);
  const closePreviewModal = () => setSelectedImage(null);

  const handleUpload = async (imageId: string) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === imageId ? { ...img, isUploading: true } : img
      )
    );

    const image = images.find((img) => img.id === imageId);
    if (!image) return;

    try {
      const formData = new FormData();
      formData.append("file", image.file);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error("API URL is not configured");
      }

      const response = await fetch(`${apiUrl}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? {
                ...img,
                isUploading: false,
                status: "completed",
                predictions: result.predictions,
              }
            : img
        )
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Upload failed",
        description: `Failed to upload ${image.name}: ${errorMessage}`,
        variant: "destructive",
      });
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId ? { ...img, status: "error", isUploading: false } : img
        )
      );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              isDragging ? "border-primary bg-primary/5" : "border-gray-300"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-muted rounded-full p-3">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium">Drag and drop a JPEG image here</p>
              <Button onClick={openFileInput} variant="outline">
                Select File
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".jpg,.jpeg"
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {images.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Uploaded Images</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative space-y-2 p-2 shadow rounded-xl">
                <div
                  className="aspect-square border rounded-md overflow-hidden cursor-pointer"
                  onClick={() => openPreviewModal(image)}
                >
                  <img src={image.url} alt={image.name} className="w-full h-full object-cover" />
                </div>

                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                >
                  <X className="h-4 w-4" />
                </button>
                <p className="text-xs truncate">{image.name}</p>

                {image.predictions && (
                  <div className="space-y-1 text-sm">
                    {image.predictions.map((pred: any) => (
                      <div className="flex justify-between" key={pred.label}>
                        <span>{pred.descrip}</span>
                        <span>{(pred.proba * 100).toFixed(2)}%</span>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  onClick={() => handleUpload(image.id)}
                  disabled={image.isUploading || image.status === "completed"}
                  className="w-full"
                >
                  {image.isUploading ? "Uploading..." : "Upload Image"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedImage && (
        <ImagePreviewModal
          image={selectedImage}
          isOpen={!!selectedImage}
          onClose={closePreviewModal}
        />
      )}
    </div>
  );
}
