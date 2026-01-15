"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Shield, User } from "lucide-react"
import { Card } from "@/components/ui/card"

export function useDevAdminMode() {
  const [isDevAdmin, setIsDevAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkDevAdmin = () => {
    if (process.env.NODE_ENV === "development") {
      // Check localStorage first (fastest, most reliable)
      const localValue = localStorage.getItem("dev_admin_mode") === "true"
      return localValue
    }
    return false
  }

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // Check localStorage immediately
      const localValue = checkDevAdmin()
      setIsDevAdmin(localValue)
      
      // Then verify with server
      fetch("/api/dev/admin-toggle", {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          const serverValue = data.enabled || false
          setIsDevAdmin(serverValue)
          // Sync localStorage with server
          if (serverValue) {
            localStorage.setItem("dev_admin_mode", "true")
          } else {
            localStorage.removeItem("dev_admin_mode")
          }
          setLoading(false)
        })
        .catch((err) => {
          console.error("Error checking dev admin mode:", err)
          // Keep localStorage value on error
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  // Listen for storage changes (when toggled in another tab/window)
  // and custom events (when toggled in same window)
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === "dev_admin_mode") {
          setIsDevAdmin(e.newValue === "true")
        }
      }
      
      const handleCustomEvent = (e: CustomEvent) => {
        setIsDevAdmin(e.detail.enabled)
      }
      
      window.addEventListener("storage", handleStorageChange)
      window.addEventListener("devAdminModeChanged", handleCustomEvent as EventListener)
      return () => {
        window.removeEventListener("storage", handleStorageChange)
        window.removeEventListener("devAdminModeChanged", handleCustomEvent as EventListener)
      }
    }
  }, [])

  const toggleDevAdmin = async () => {
    if (process.env.NODE_ENV === "development") {
      const newValue = !isDevAdmin
      
      // Update localStorage immediately for instant UI feedback
      if (newValue) {
        localStorage.setItem("dev_admin_mode", "true")
      } else {
        localStorage.removeItem("dev_admin_mode")
      }
      setIsDevAdmin(newValue)
      
      // Dispatch custom event to notify all components
      window.dispatchEvent(new CustomEvent("devAdminModeChanged", { 
        detail: { enabled: newValue } 
      }))
      
      try {
        const response = await fetch("/api/dev/admin-toggle", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ enabled: newValue }),
          credentials: "include", // Important for cookies
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log("Dev admin mode toggled:", data)
          // Reload after a short delay to apply server-side changes
          setTimeout(() => {
            window.location.reload()
          }, 200)
        } else {
          const errorText = await response.text()
          console.error("Failed to toggle admin mode:", errorText)
          // Revert on error
          setIsDevAdmin(!newValue)
          if (!newValue) {
            localStorage.setItem("dev_admin_mode", "true")
          } else {
            localStorage.removeItem("dev_admin_mode")
          }
          window.dispatchEvent(new CustomEvent("devAdminModeChanged", { 
            detail: { enabled: !newValue } 
          }))
        }
      } catch (error) {
        console.error("Failed to toggle admin mode:", error)
        // Revert on error
        setIsDevAdmin(!newValue)
        if (!newValue) {
          localStorage.setItem("dev_admin_mode", "true")
        } else {
          localStorage.removeItem("dev_admin_mode")
        }
        window.dispatchEvent(new CustomEvent("devAdminModeChanged", { 
          detail: { enabled: !newValue } 
        }))
      }
    }
  }

  return { isDevAdmin, toggleDevAdmin, loading }
}

export default function DevAdminToggle() {
  const { isDevAdmin, toggleDevAdmin, loading } = useDevAdminMode()

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  if (loading) {
    return (
      <Card className="fixed bottom-4 right-4 z-50 p-3 shadow-lg border-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-950">
        <div className="text-xs">Loading...</div>
      </Card>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 p-3 shadow-lg border-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-950">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-yellow-800 dark:text-yellow-200">
          DEV MODE
        </span>
        <Button
          size="sm"
          variant={isDevAdmin ? "default" : "outline"}
          onClick={toggleDevAdmin}
          className="h-7 text-xs"
        >
          {isDevAdmin ? (
            <>
              <Shield className="h-3 w-3 mr-1" />
              Admin
            </>
          ) : (
            <>
              <User className="h-3 w-3 mr-1" />
              User
            </>
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {isDevAdmin
          ? "Simulating admin privileges"
          : "Simulating regular user"}
      </p>
    </Card>
  )
}

