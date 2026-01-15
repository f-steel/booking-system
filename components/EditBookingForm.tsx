"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"

interface Booking {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  shoeType: string
  serviceType: string
  scheduledDate: Date
  notes: string | null
  status: string
}

export default function EditBookingForm({ booking }: { booking: Booking }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone || "",
    shoeType: booking.shoeType,
    serviceType: booking.serviceType,
    scheduledDate: format(new Date(booking.scheduledDate), "yyyy-MM-dd'T'HH:mm"),
    notes: booking.notes || "",
    status: booking.status,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to update booking")
      } else {
        router.push("/bookings")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Booking</CardTitle>
        <CardDescription>Update booking details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name *</Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) =>
                setFormData({ ...formData, customerName: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerEmail">Customer Email *</Label>
            <Input
              id="customerEmail"
              type="email"
              value={formData.customerEmail}
              onChange={(e) =>
                setFormData({ ...formData, customerEmail: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerPhone">Customer Phone</Label>
            <Input
              id="customerPhone"
              type="tel"
              value={formData.customerPhone}
              onChange={(e) =>
                setFormData({ ...formData, customerPhone: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shoeType">Shoe Type *</Label>
            <Select
              id="shoeType"
              value={formData.shoeType}
              onChange={(e) =>
                setFormData({ ...formData, shoeType: e.target.value })
              }
              required
            >
              <option value="sneakers">Sneakers</option>
              <option value="running">Running Shoes</option>
              <option value="basketball">Basketball Shoes</option>
              <option value="trainers">Trainers</option>
              <option value="leather">Leather Shoes</option>
              <option value="other">Other</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceType">Service Type *</Label>
            <Select
              id="serviceType"
              value={formData.serviceType}
              onChange={(e) =>
                setFormData({ ...formData, serviceType: e.target.value })
              }
              required
            >
              <option value="basic">Basic Clean</option>
              <option value="deep">Deep Clean</option>
              <option value="restoration">Restoration</option>
              <option value="custom">Custom Service</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              required
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduledDate">Scheduled Date *</Label>
            <Input
              id="scheduledDate"
              type="datetime-local"
              value={formData.scheduledDate}
              onChange={(e) =>
                setFormData({ ...formData, scheduledDate: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={4}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Booking"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}


