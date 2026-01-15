import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isAdmin } from "@/lib/admin"

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""

    // Only admins can search all users, regular users can only see themselves
    const userIsAdmin = await isAdmin()

    if (userIsAdmin) {
      // SQLite doesn't support case-insensitive mode, so we use contains
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { email: { contains: query } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
        take: 10,
      })

      // Filter case-insensitively in JavaScript for SQLite
      const filteredUsers = query
        ? users.filter(
            (user) =>
              user.name?.toLowerCase().includes(query.toLowerCase()) ||
              user.email.toLowerCase().includes(query.toLowerCase())
          )
        : users

      return NextResponse.json(filteredUsers)
    } else {
      // Regular users can only see their own info
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
        },
      })

      return NextResponse.json(user ? [user] : [])
    }
  } catch (error) {
    console.error("Error searching users:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

