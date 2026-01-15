import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import EditBookingForm from "@/components/EditBookingForm"

async function getBooking(id: string) {
  const session = await auth()
  if (!session) return null

  return await prisma.booking.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  })
}

export default async function EditBookingPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const booking = await getBooking(params.id)

  if (!booking) {
    redirect("/bookings")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <EditBookingForm booking={booking} />
      </div>
    </div>
  )
}

