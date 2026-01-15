import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import AdminDashboard from "@/components/AdminDashboard"

async function getAdminData() {
  const session = await requireAdmin()

  const [users, bookings, stats] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        createdAt: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.booking.findMany({
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
      take: 10,
    }),
    prisma.booking.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    }),
  ])

  return { users, bookings, stats, session }
}

export default async function AdminPage() {
  const { users, bookings, stats, session } = await getAdminData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage users, view bookings, and monitor system activity
          </p>
        </div>

        <AdminDashboard
          initialUsers={users}
          initialBookings={bookings}
          stats={stats}
        />
      </div>
    </div>
  )
}

