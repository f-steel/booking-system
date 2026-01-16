"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import Image from "next/image"

interface Photo {
  id: string
  url: string
  caption: string | null
  createdAt: Date
}

export default function BookingPhotos({ bookingId }: { bookingId: string }) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState("")

  useEffect(() => {
    fetchPhotos()
  }, [bookingId])

  const fetchPhotos = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/photos`)
      if (response.ok) {
        const data = await response.json()
        setPhotos(data)
      }
    } catch (error) {
      console.error("Error fetching photos:", error)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    if (caption.trim()) {
      formData.append("caption", caption.trim())
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}/photos`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const newPhoto = await response.json()
        setPhotos([newPhoto, ...photos])
        setCaption("")
        e.target.value = ""
      } else {
        alert("Failed to upload photo")
      }
    } catch (error) {
      alert("Error uploading photo")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Photos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="photo-upload">Add Photo</Label>
              <Input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="cursor-pointer"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="photo-caption">Caption (optional)</Label>
              <Input
                id="photo-caption"
                type="text"
                placeholder="Photo caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                disabled={uploading}
              />
            </div>
          </div>

          {photos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No photos yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <div className="aspect-square relative rounded-lg overflow-hidden border">
                    <Image
                      src={photo.url}
                      alt={photo.caption || "Booking photo"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  {photo.caption && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {photo.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


