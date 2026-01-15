import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { getStatusInfo } from "@/lib/booking-status";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-slate-950 dark:via-gray-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-2">
            All Bookings
          </h1>
          <p className="text-muted-foreground">
            View and manage all bookings in the system
          </p>
        </div>

        <Card className="shadow-lg border-2">
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
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              getStatusInfo(booking.status).color
                            }`}
                          >
                            {getStatusInfo(booking.status).label}
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
                          Created:{" "}
                          {format(new Date(booking.createdAt), "PPP p")}
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
  );
}

