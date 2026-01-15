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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-slate-950 dark:via-gray-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="mb-10 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-3">
            FK Trainers
          </h1>
          <p className="text-lg text-muted-foreground">
            Shoe Cleaning Booking System
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow duration-300 border-2 hover:border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl">View Bookings</CardTitle>
              <CardDescription>See all your bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/bookings">
                <Button className="w-full">View Bookings</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 border-2 hover:border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl">New Booking</CardTitle>
              <CardDescription>Create a new booking</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/bookings/new">
                <Button className="w-full">Create Booking</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 border-2 hover:border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl">Profile</CardTitle>
              <CardDescription>Manage your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Logged in as: {session.user?.email}
              </p>
              <Link href="/profile">
                <Button className="w-full">Edit Profile</Button>
              </Link>
              <form action="/api/auth/signout" method="POST">
                <Button type="submit" variant="outline" className="w-full">
                  Sign Out
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
