import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { Edit, Plus } from "lucide-react"
import DeleteBookingButton from "@/components/DeleteBookingButton"

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Bookings</h1>
            <p className="text-gray-600">Manage your shoe cleaning bookings</p>
          </div>
          <Link href="/bookings/new">
            <Button>
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
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{booking.customerName}</CardTitle>
                      <CardDescription>{booking.customerEmail}</CardDescription>
                    </div>
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

