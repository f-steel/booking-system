import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

async function getAllBookings() {
  await requireAdmin()

  return await prisma.booking.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      scheduledDate: "desc",
    },
  })
}

export default async function AdminBookingsPage() {
  const bookings = await getAllBookings()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            All Bookings
          </h1>
          <p className="text-gray-600">
            View and manage all bookings in the system
          </p>
        </div>

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
                    className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium text-lg">
                            {booking.customerName}
                          </p>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              booking.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : booking.status === "in_progress"
                                ? "bg-blue-100 text-blue-800"
                                : booking.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {booking.status}
                          </span>
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
                        </div>
                        {booking.notes && (
                          <p className="text-sm text-muted-foreground mt-2">
                            <span className="font-medium">Notes:</span>{" "}
                            {booking.notes}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Created: {format(new Date(booking.createdAt), "PPP p")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

