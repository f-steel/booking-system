import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import ProfileForm from "@/components/ProfileForm"

async function getUserProfile() {
  const session = await auth()
  if (!session) return null

  return await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      city: true,
      postcode: true,
    },
  })
}

export default async function ProfilePage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const user = await getUserProfile()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-slate-950 dark:via-gray-950 dark:to-slate-900 py-4 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6 max-w-2xl">
        <ProfileForm user={user} />
      </div>
    </div>
  )
}

