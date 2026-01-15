import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export async function requireAdmin() {
  const session = await auth()
  
  if (!session) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  })

  if (!user || !user.isAdmin) {
    redirect("/")
  }

  return session
}

export async function isAdmin() {
  const session = await auth()
  
  if (!session) {
    return false
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  })

  return user?.isAdmin ?? false
}

