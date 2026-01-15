import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { getStatusInfo } from "@/lib/booking-status"
import BookingComments from "@/components/BookingComments"

async function getBooking(id: string) {
  const session = await auth()
  if (!session) return null

  return await prisma.booking.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          photos: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  })
}

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const { id } = await params
  const booking = await getBooking(id)

  if (!booking) {
    redirect("/bookings")
  }

  const statusInfo = getStatusInfo(booking.status)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <Link href="/bookings">
          <Button variant="ghost" className="mb-4 w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bookings
          </Button>
        </Link>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{booking.customerName}</CardTitle>
                  <CardDescription>{booking.customerEmail}</CardDescription>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">Shoe Type:</span> {booking.shoeType}
                </div>
                <div>
                  <span className="font-medium">Service:</span> {booking.serviceType}
                </div>
                <div>
                  <span className="font-medium">Scheduled:</span>{" "}
                  {format(new Date(booking.scheduledDate), "PPP p")}
                </div>
                {booking.customerPhone && (
                  <div>
                    <span className="font-medium">Phone:</span> {booking.customerPhone}
                  </div>
                )}
                {booking.notes && (
                  <div>
                    <span className="font-medium">Notes:</span>
                    <p className="mt-1 text-muted-foreground">{booking.notes}</p>
                  </div>
                )}
                <div className="pt-4 border-t">
                  <Link href={`/bookings/${booking.id}/edit`}>
                    <Button variant="outline" size="sm" className="w-full">
                      Edit Booking
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <BookingComments bookingId={booking.id} />
          </div>
        </div>
      </div>
    </div>
  )
}

