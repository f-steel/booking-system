import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function Home() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            FK Trainers
          </h1>
          <p className="text-gray-600">Shoe Cleaning Booking System</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>View Bookings</CardTitle>
              <CardDescription>See all your bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/bookings">
                <Button className="w-full">View Bookings</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>New Booking</CardTitle>
              <CardDescription>Create a new booking</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/bookings/new">
                <Button className="w-full">Create Booking</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your account</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Logged in as: {session.user?.email}
              </p>
              <form action="/api/auth/signout" method="POST">
                <Button type="submit" variant="outline" className="w-full">Sign Out</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
