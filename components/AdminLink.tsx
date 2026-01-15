"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"

export default function AdminLink() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAdmin() {
      try {
        const response = await fetch("/api/admin/check")
        if (response.ok) {
          const data = await response.json()
          setIsAdmin(data.isAdmin)
        }
      } catch (error) {
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }
    checkAdmin()
  }, [])

  if (loading || !isAdmin) {
    return null
  }

  return (
    <Link href="/admin">
      <Button variant="ghost" size="sm">
        <Shield className="h-4 w-4 mr-2" />
        Admin
      </Button>
    </Link>
  )
}

