"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

type UploadedImage = {
  id: string
  url: string
  name: string
}

interface ImagePreviewModalProps {
  image: UploadedImage
  isOpen: boolean
  onClose: () => void
}

export function ImagePreviewModal({ image, isOpen, onClose }: ImagePreviewModalProps) {
  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = image.url
    link.download = image.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="truncate max-w-[calc(100%-100px)]">{image.name}</span>
            <Button variant="outline" size="icon" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 flex justify-center">
          <img
            src={image.url || "/placeholder.svg"}
            alt={image.name}
            className="max-h-[70vh] max-w-full object-contain rounded-md"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
