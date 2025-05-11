"use client";

import type React from "react";
import { useState, useRef } from "react";
import { X, Upload, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImagePreviewModal } from "./image-preview-modal";
import { useToast } from "@/hooks/use-toast";

export function ImageUploader() {
  const [images, setImages] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<any>(null);
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

    const reader = new FileReader();
    reader.onload = (e) => {
      const newImage = {
        id: crypto.randomUUID(),
        url: e.target?.result as string,
        name: file.name,
        file,
        status: "pending",
        predictions: null,
        isUploading: false,
      };
      setImages((prev) => [...prev, newImage]);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (id: string) => setImages((prev) => prev.filter((img) => img.id !== id));
  const openFileInput = () => fileInputRef.current?.click();
  const openPreviewModal = (image: any) => setSelectedImage(image);
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

      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        body: formData,
      });

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
      toast({
        title: "Upload failed",
        description: `Failed to upload ${image.name}`,
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
