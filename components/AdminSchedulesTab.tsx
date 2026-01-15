"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from "date-fns"
import { Calendar, MapPin, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react"
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
  collectionRequired: boolean
  collectionAddress: string | null
  collectionCity: string | null
  collectionPostcode: string | null
}

export default function AdminSchedulesTab() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/admin/bookings")
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }) // Monday
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 }) // Sunday
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const bookingsByDate = bookings.reduce((acc, booking) => {
    const date = format(new Date(booking.scheduledDate), "yyyy-MM-dd")
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(booking)
    return acc
  }, {} as Record<string, Booking[]>)

  const collectionBookings = bookings.filter(
    (b) => b.collectionRequired && b.status !== "completed" && b.status !== "cancelled"
  )

  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1))
  }

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1))
  }

  const goToToday = () => {
    setCurrentWeek(new Date())
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">Loading schedules...</div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Collection Planning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Collection Planning
          </CardTitle>
          <CardDescription>
            Bookings that require collection ({collectionBookings.length})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {collectionBookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No collection bookings at this time
            </p>
          ) : (
            <div className="space-y-3">
              {collectionBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium">{booking.customerName}</p>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            getStatusInfo(booking.status).color
                          }`}
                        >
                          {getStatusInfo(booking.status).label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {booking.customerEmail}
                        {booking.customerPhone && ` • ${booking.customerPhone}`}
                      </p>
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <div>
                          <p className="font-medium">Collection Address:</p>
                          <p className="text-muted-foreground">
                            {booking.collectionAddress}
                            <br />
                            {booking.collectionCity}, {booking.collectionPostcode}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Scheduled: {format(new Date(booking.scheduledDate), "PPP p")}
                      </p>
                    </div>
                    <Link href={`/bookings/${booking.id}/edit`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Weekly Schedule
              </CardTitle>
              <CardDescription>
                View bookings by scheduled date
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {weekDays.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd")
              const dayBookings = bookingsByDate[dateKey] || []
              const isToday = isSameDay(day, new Date())
              const isSelected = selectedDate && isSameDay(day, selectedDate)

              return (
                <div
                  key={dateKey}
                  className={`border rounded-lg p-3 min-h-[200px] ${
                    isToday ? "bg-primary/5 border-primary" : ""
                  } ${isSelected ? "ring-2 ring-primary" : ""}`}
                >
                  <div className="mb-2">
                    <p
                      className={`text-sm font-medium ${
                        isToday ? "text-primary" : ""
                      }`}
                    >
                      {format(day, "EEE")}
                    </p>
                    <p
                      className={`text-lg font-bold ${
                        isToday ? "text-primary" : ""
                      }`}
                    >
                      {format(day, "d")}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {dayBookings.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No bookings</p>
                    ) : (
                      dayBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="p-2 bg-accent rounded text-xs cursor-pointer hover:bg-accent/80 transition-colors"
                          onClick={() => setSelectedDate(day)}
                        >
                          <p className="font-medium truncate">{booking.customerName}</p>
                          <p className="text-muted-foreground truncate">
                            {format(new Date(booking.scheduledDate), "HH:mm")}
                          </p>
                          <span
                            className={`inline-block px-1 py-0.5 text-xs rounded mt-1 ${
                              getStatusInfo(booking.status).color
                            }`}
                          >
                            {getStatusInfo(booking.status).label}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {selectedDate && (
            <div className="mt-6 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">
                  Bookings for {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedDate(null)}>
                  Close
                </Button>
              </div>
              <div className="space-y-2">
                {(bookingsByDate[format(selectedDate, "yyyy-MM-dd")] || []).map(
                  (booking) => (
                    <div
                      key={booking.id}
                      className="p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{booking.customerName}</p>
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                getStatusInfo(booking.status).color
                              }`}
                            >
                              {getStatusInfo(booking.status).label}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(booking.scheduledDate), "HH:mm")} •{" "}
                            {booking.shoeType} • {booking.serviceType}
                          </p>
                          {booking.collectionRequired && (
                            <p className="text-xs text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              Collection required
                            </p>
                          )}
                        </div>
                        <Link href={`/bookings/${booking.id}/edit`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

