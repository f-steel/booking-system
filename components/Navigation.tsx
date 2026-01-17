"use client"

import { useState } from "react";
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Home, Calendar, LogOut, Menu, X, User } from "lucide-react";
import AdminLink from "./AdminLink";

export default function Navigation() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!session) {
    return null;
  }

  return (
    <nav className="border-b bg-white dark:bg-gray-950 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/"
              className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100"
            >
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
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await signOut({
                  callbackUrl: "/login",
                  redirect: true,
                });
              }}
              className="text-xs sm:text-sm"
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white dark:bg-gray-950 py-4">
            <div className="flex flex-col gap-2">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Link href="/bookings" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Bookings
                </Button>
              </Link>
              <div onClick={() => setMobileMenuOpen(false)}>
                <AdminLink />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}


