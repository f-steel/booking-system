"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { Users, Calendar, Shield, Search } from "lucide-react"
import Link from "next/link"

interface User {
  id: string
  name: string | null
  email: string
  isAdmin: boolean
  createdAt: Date
  _count: {
    bookings: number
  }
}

interface Booking {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  shoeType: string
  serviceType: string
  status: string
  scheduledDate: Date
  createdAt: Date
  user: {
    id: string
    name: string | null
    email: string
  } | null
}

interface Stat {
  status: string
  _count: {
    id: number
  }
}

export default function AdminDashboard({
  initialUsers,
  initialBookings,
  stats,
}: {
  initialUsers: User[]
  initialBookings: Booking[]
  stats: Stat[]
}) {
  const [users, setUsers] = useState(initialUsers)
  const [bookings] = useState(initialBookings)
  const [searchTerm, setSearchTerm] = useState("")
  const [updating, setUpdating] = useState<string | null>(null)

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    setUpdating(userId)
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          isAdmin: !currentStatus,
        }),
      })

      if (response.ok) {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId
              ? { ...user, isAdmin: !currentStatus }
              : user
          )
        )
      } else {
        alert("Failed to update user")
      }
    } catch (error) {
      alert("An error occurred")
    } finally {
      setUpdating(null)
    }
  }

  const totalBookings = stats.reduce((sum, stat) => sum + stat._count.id, 0)
  const pendingBookings = stats.find((s) => s.status === "pending")?._count.id ?? 0
  const completedBookings = stats.find((s) => s.status === "completed")?._count.id ?? 0

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {users.filter((u) => u.isAdmin).length} admins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              {pendingBookings} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedBookings}</div>
            <p className="text-xs text-muted-foreground">Bookings completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.isAdmin).length}
            </div>
            <p className="text-xs text-muted-foreground">Admin users</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Management */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage users and their admin status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{user.name || "No name"}</p>
                    {user.isAdmin && (
                      <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {user._count.bookings} bookings • Joined{" "}
                    {format(new Date(user.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
                <Button
                  variant={user.isAdmin ? "destructive" : "default"}
                  size="sm"
                  onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                  disabled={updating === user.id}
                >
                  {updating === user.id
                    ? "Updating..."
                    : user.isAdmin
                    ? "Remove Admin"
                    : "Make Admin"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>Latest 10 bookings across all users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{booking.customerName}</p>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
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
                    <p className="text-sm text-muted-foreground">
                      {booking.customerEmail}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.shoeType} • {booking.serviceType}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Scheduled: {format(new Date(booking.scheduledDate), "PPP")}
                      {booking.user && (
                        <> • Created by: {booking.user.name || booking.user.email}</>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link href="/admin/bookings">
              <Button variant="outline" className="w-full">
                View All Bookings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

