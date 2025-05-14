import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MobileNet Image Classifier',
  description: 'A web application for real-time image classification using MobileNet neural network, deployed on Minikube',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
