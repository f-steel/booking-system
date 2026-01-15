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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-slate-950 dark:via-gray-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
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

