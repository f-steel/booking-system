"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, User } from "lucide-react"
import { Card } from "@/components/ui/card"

interface User {
  id: string
  name: string | null
  email: string
}

interface UserSearchProps {
  onSelect: (user: User) => void
  selectedUser: User | null
  isAdmin: boolean
}

export default function UserSearch({ onSelect, selectedUser, isAdmin }: UserSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!isAdmin) {
      // Non-admins can only use their own info
      fetch("/api/users/search?q=")
        .then((res) => res.json())
        .then((data) => {
          if (data.length > 0) {
            setUsers(data)
            onSelect(data[0])
          }
        })
      return
    }

    if (searchQuery.length < 2) {
      setUsers([])
      setShowResults(false)
      return
    }

    const debounce = setTimeout(() => {
      setLoading(true)
      fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
        .then((res) => res.json())
        .then((data) => {
          setUsers(data)
          setShowResults(true)
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
        })
    }, 300)

    return () => clearTimeout(debounce)
  }, [searchQuery, isAdmin, onSelect])

  if (!isAdmin && selectedUser) {
    return (
      <div className="space-y-2">
        <Label>Customer</Label>
        <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">{selectedUser.name || "No name"}</p>
            <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2" ref={searchRef}>
      <Label htmlFor="user-search">Search Customer {isAdmin ? "(Admin)" : ""}</Label>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="user-search"
            type="text"
            placeholder={isAdmin ? "Search by name or email..." : "Loading your info..."}
            value={selectedUser ? `${selectedUser.name || ""} (${selectedUser.email})` : searchQuery}
            onChange={(e) => {
              if (!selectedUser) {
                setSearchQuery(e.target.value)
              }
            }}
            onFocus={() => {
              if (users.length > 0) {
                setShowResults(true)
              }
            }}
            disabled={!!selectedUser || !isAdmin}
            className="pl-10"
          />
          {selectedUser && (
            <button
              type="button"
              onClick={() => {
                onSelect(null as any)
                setSearchQuery("")
                setShowResults(false)
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          )}
        </div>

        {showResults && users.length > 0 && (
          <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-auto">
            <div className="p-1">
              {users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => {
                    onSelect(user)
                    setSearchQuery("")
                    setShowResults(false)
                  }}
                  className="w-full text-left p-2 rounded-md hover:bg-accent transition-colors flex items-center gap-2"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{user.name || "No name"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        )}

        {loading && (
          <p className="absolute left-3 bottom-1 text-xs text-muted-foreground">
            Searching...
          </p>
        )}
      </div>
    </div>
  )
}

