"use client"

import type React from "react"

import { useState, useRef } from "react"
import { X, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ImagePreviewModal } from "./image-preview-modal"
import { useToast } from "@/hooks/use-toast"

type UploadedImage = {
  id: string
  url: string
  name: string
  status: "pending" | "uploading" | "completed" | "error"
  progress: number
}

export function ImageUploader() {
  const [images, setImages] = useState<UploadedImage[] | UpdatedImages[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [overallProgress, setOverallProgress] = useState(0)

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
          status: "pending",
          progress: 0,
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

  const handleUploadAll = async () => {
    if (images.length === 0) {
      toast({
        title: "No images to upload",
        description: "Please add images before uploading.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setOverallProgress(0)

    // Create a copy of images to update their progress
    const updatedImages = [...images].map((img) => ({ ...img, status: "uploading", progress: 0 }))
    setImages(updatedImages)

    // Track completed uploads
    let completedUploads = 0

    // Process each image
    for (let i = 0; i < updatedImages.length; i++) {
      const image = updatedImages[i]

      try {
        // Simulate upload with progress updates
        for (let progress = 0; progress <= 100; progress += 5) {
          // Update this image's progress
          updatedImages[i] = {
            ...updatedImages[i],
            progress,
            status: progress === 100 ? "completed" : "uploading",
          }

          // Update state
          setImages([...updatedImages])

          // Calculate and update overall progress
          const totalProgress = updatedImages.reduce((sum, img) => sum + img.progress, 0)
          const overallPercent = Math.floor((totalProgress / (updatedImages.length * 100)) * 100)
          setOverallProgress(overallPercent)

          // Simulate network delay
          
        }

        completedUploads++
      } catch (error) {
        // Handle error
        updatedImages[i] = {
          ...updatedImages[i],
          status: "error",
          progress: 0,
        }

        setImages([...updatedImages])

        toast({
          title: "Upload failed",
          description: `Failed to upload ${image.name}`,
          variant: "destructive",
        })
      }
    }

    setIsUploading(false)

    toast({
      title: "Upload complete",
      description: `Successfully uploaded ${completedUploads} of ${images.length} images.`,
    })
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
                  {image.status === "uploading" && (
                    <div className="absolute bottom-0 left-0 right-0 bg-background/80 p-1">
                      <Progress value={image.progress} className="h-1" />
                    </div>
                  )}
                  {image.status === "completed" && (
                    <div className="absolute bottom-0 right-0 bg-green-500 text-white text-xs p-1 rounded-tl-md">✓</div>
                  )}
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

          <div className="mt-6 space-y-4">
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall progress</span>
                  <span>{overallProgress}%</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>
            )}

            <Button onClick={handleUploadAll} disabled={isUploading || images.length === 0} className="w-full">
              {isUploading ? "Uploading..." : "Upload All Images"}
            </Button>
          </div>
        </div>
      )}

      {selectedImage && (
        <ImagePreviewModal image={selectedImage} isOpen={!!selectedImage} onClose={closePreviewModal} />
      )}
    </div>
  )
}
