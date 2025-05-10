"use client"

import type React from "react"

import { useState, useRef } from "react"
import { X, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ImagePreviewModal } from "./image-preview-modal"
import { useToast } from "@/hooks/use-toast"

type UploadedImage = {
  id: string
  url: string
  name: string
}

export function ImageUploader() {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      processFiles(Array.from(files))
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files) {
      processFiles(Array.from(files))
    }
  }

  const processFiles = (files: File[]) => {
    for (const file of files) {
      // Check if file is a JPEG
      if (file.type !== "image/jpeg") {
        toast({
          title: "Unsupported file type",
          description: `${file.name} is not a JPEG image. Only JPEG images are supported.`,
          variant: "destructive",
        })
        continue
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const newImage: UploadedImage = {
          id: crypto.randomUUID(),
          url: e.target?.result as string,
          name: file.name,
        }
        setImages((prev) => [...prev, newImage])
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((image) => image.id !== id))
  }

  const openFileInput = () => {
    fileInputRef.current?.click()
  }

  const openPreviewModal = (image: UploadedImage) => {
    setSelectedImage(image)
  }

  const closePreviewModal = () => {
    setSelectedImage(null)
  }

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
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="bg-muted rounded-full p-3">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-medium">Drag and drop your images here</p>
                <p className="text-sm text-muted-foreground mt-1">Only JPEG images are supported</p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={openFileInput} variant="outline">
                  Select Files
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg"
                  multiple
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {images.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Uploaded Images ({images.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image) => (
              <div key={image.id} className="group relative">
                <div
                  className="aspect-square rounded-md overflow-hidden border cursor-pointer"
                  onClick={() => openPreviewModal(image)}
                >
                  <img
                    src={image.url || "/placeholder.svg"}
                    alt={image.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md"
                >
                  <X className="h-4 w-4" />
                </button>
                <p className="text-xs mt-1 truncate">{image.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedImage && (
        <ImagePreviewModal image={selectedImage} isOpen={!!selectedImage} onClose={closePreviewModal} />
      )}
    </div>
  )
}
