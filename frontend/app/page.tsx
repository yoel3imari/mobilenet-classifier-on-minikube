import { ImageUploader } from "@/components/image-uploader"

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">MobileNet Image Classifier</h1>
      <ImageUploader />
    </main>
  )
}
