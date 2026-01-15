"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, MessageSquare, Image as ImageIcon, X } from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"

interface CommentPhoto {
  id: string
  url: string
  createdAt: Date
}

interface Comment {
  id: string
  message: string
  createdAt: Date
  photos: CommentPhoto[]
  user: {
    id: string
    name: string | null
    email: string
  } | null
}

export default function BookingComments({ bookingId }: { bookingId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles((prev) => [...prev, ...files])
    
    // Create previews
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!message.trim() && selectedFiles.length === 0) || loading) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("message", message.trim())
      selectedFiles.forEach((file) => {
        formData.append("photos", file)
      })

      const response = await fetch(`/api/bookings/${bookingId}/comments`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const newComment = await response.json()
        setComments([...comments, newComment])
        setMessage("")
        setSelectedFiles([])
        setPreviews([])
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } else {
        alert("Failed to add comment")
      }
    } catch {
      alert("Error adding comment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-2">
            {/* Photo previews - shown above textarea like modern chat */}
            {previews.length > 0 && (
              <div className="flex gap-2 flex-wrap p-2 bg-muted/30 rounded-lg border border-dashed">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="w-20 h-20 relative rounded-lg overflow-hidden border-2 border-background shadow-sm">
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 shadow-md hover:bg-destructive/90 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <Textarea
                  placeholder={selectedFiles.length > 0 ? "Add a message (optional)..." : "Add a comment..."}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={selectedFiles.length > 0 ? 2 : 3}
                  className="pr-10"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="comment-photos"
                />
                <label
                  htmlFor="comment-photos"
                  className="absolute bottom-2 right-2 cursor-pointer p-1.5 rounded-md hover:bg-accent transition-colors"
                  title="Add photos"
                >
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                </label>
              </div>
              <Button
                type="submit"
                disabled={(!message.trim() && selectedFiles.length === 0) || loading}
                size="default"
                className="h-10"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>

          <div className="space-y-3 mt-4">
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border rounded-lg p-3 bg-muted/50"
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium text-sm">
                      {comment.user?.name || comment.user?.email || "Unknown"}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(comment.createdAt), "MMM d, h:mm a")}
                    </span>
                  </div>
                  <p className="text-sm">{comment.message}</p>
                  {comment.photos && comment.photos.length > 0 && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {comment.photos.map((photo) => (
                        <div
                          key={photo.id}
                          className="relative w-24 h-24 rounded-lg overflow-hidden border"
                        >
                          <Image
                            src={photo.url}
                            alt="Comment photo"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

