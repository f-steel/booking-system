"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Home, Calendar, LogOut } from "lucide-react"
import AdminLink from "./AdminLink"

export default function Navigation() {
  const { data: session } = useSession()

  if (!session) {
    return null
  }

  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold text-gray-900">
              FK Trainers
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Link href="/bookings">
                <Button variant="ghost" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Bookings
                </Button>
              </Link>
              <AdminLink />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {session.user?.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}


