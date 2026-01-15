import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { Edit, Plus, Eye } from "lucide-react"
import DeleteBookingButton from "@/components/DeleteBookingButton"
import { getStatusInfo } from "@/lib/booking-status"

async function getBookings() {
  const session = await auth()
  if (!session) return []

  return await prisma.booking.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      scheduledDate: "desc",
    },
  })
}

export default async function BookingsPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const bookings = await getBookings()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-slate-950 dark:via-gray-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-2">Bookings</h1>
            <p className="text-muted-foreground">Manage your shoe cleaning bookings</p>
          </div>
          <Link href="/bookings/new">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              New Booking
            </Button>
          </Link>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No bookings yet</p>
              <Link href="/bookings/new">
                <Button>Create Your First Booking</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{booking.customerName}</CardTitle>
                      <CardDescription>{booking.customerEmail}</CardDescription>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusInfo(booking.status).color}`}
                    >
                      {getStatusInfo(booking.status).label}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
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
                      {format(new Date(booking.scheduledDate), "PPP")}
                    </p>
                    {booking.customerPhone && (
                      <p>
                        <span className="font-medium">Phone:</span>{" "}
                        {booking.customerPhone}
                      </p>
                    )}
                    {booking.notes && (
                      <p className="text-muted-foreground">
                        <span className="font-medium">Notes:</span>{" "}
                        {booking.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Link href={`/bookings/${booking.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/bookings/${booking.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <DeleteBookingButton bookingId={booking.id} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

