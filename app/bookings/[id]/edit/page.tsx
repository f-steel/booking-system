import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isAdmin } from "@/lib/admin"
import EditBookingForm from "@/components/EditBookingForm"

async function getBooking(id: string, userIsAdmin: boolean, userId: string) {
  const session = await auth()
  if (!session) return null

  return await prisma.booking.findFirst({
    where: {
      id,
      ...(userIsAdmin ? {} : { userId }),
    },
  })
}

export default async function EditBookingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const { id } = await params
  const userIsAdmin = await isAdmin()
  const booking = await getBooking(id, userIsAdmin, session.user.id)

  if (!booking) {
    redirect("/bookings")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6 max-w-2xl">
        <EditBookingForm booking={booking} isAdmin={userIsAdmin} />
      </div>
    </div>
  )
}

