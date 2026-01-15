"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Calendar, Eye, Edit } from "lucide-react"
import Link from "next/link"
import { getStatusInfo } from "@/lib/booking-status"

interface Booking {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  shoeType: string
  serviceType: string
  status: string
  scheduledDate: Date
  createdAt: Date
  collectionRequired: boolean
  collectionAddress: string | null
  collectionCity: string | null
  collectionPostcode: string | null
  user: {
    id: string
    name: string | null
    email: string
  } | null
}

interface Stat {
  status: string
  _count: {
    id: number
  }
}

export default function AdminBookingsTab({
  initialBookings,
  stats,
}: {
  initialBookings: Booking[]
  stats: Stat[]
}) {
  const [bookings, setBookings] = useState(initialBookings)

  // Refresh bookings periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/admin/bookings")
        if (response.ok) {
          const data = await response.json()
          setBookings(data)
        }
      } catch (error) {
        console.error("Error refreshing bookings:", error)
      }
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const totalBookings = stats.reduce((sum, stat) => sum + stat._count.id, 0)
  const pendingBookings =
    stats.find((s) => s.status === "pending_confirmation")?._count.id ?? 0
  const inProgressBookings =
    stats.find((s) => s.status === "in_progress")?._count.id ?? 0
  const readyBookings =
    stats.find((s) => s.status === "ready_for_collection")?._count.id ?? 0
  const completedBookings =
    stats.find((s) => s.status === "completed")?._count.id ?? 0

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">All bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBookings}</div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressBookings}</div>
            <p className="text-xs text-muted-foreground">Being processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readyBookings}</div>
            <p className="text-xs text-muted-foreground">Ready for collection</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedBookings}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings ({bookings.length})</CardTitle>
          <CardDescription>
            Complete list of all bookings across all users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No bookings found
            </p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-lg">{booking.customerName}</p>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          getStatusInfo(booking.status).color
                        }`}
                      >
                        {getStatusInfo(booking.status).label}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/bookings/${booking.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                      </Link>
                      <Link href={`/bookings/${booking.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {booking.customerEmail}
                    </p>
                    {booking.customerPhone && (
                      <p>
                        <span className="font-medium">Phone:</span>{" "}
                        {booking.customerPhone}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Shoe Type:</span>{" "}
                      {booking.shoeType}
                    </p>
                    <p>
                      <span className="font-medium">Service:</span>{" "}
                      {booking.serviceType}
                    </p>
                    <p>
                      <span className="font-medium">Scheduled:</span>{" "}
                      {format(new Date(booking.scheduledDate), "PPP p")}
                    </p>
                    {booking.user && (
                      <p>
                        <span className="font-medium">Created by:</span>{" "}
                        {booking.user.name || booking.user.email}
                      </p>
                    )}
                    {booking.collectionRequired && (
                      <>
                        <p>
                          <span className="font-medium">Collection:</span> Yes
                        </p>
                        <p className="col-span-full">
                          <span className="font-medium">Address:</span>{" "}
                          {booking.collectionAddress}, {booking.collectionCity},{" "}
                          {booking.collectionPostcode}
                        </p>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Created: {format(new Date(booking.createdAt), "PPP p")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

