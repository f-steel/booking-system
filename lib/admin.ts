import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

// Helper to check dev admin mode from server-side
async function getDevAdminMode(): Promise<boolean> {
  if (process.env.NODE_ENV !== "development") {
    return false
  }
  
  try {
    const cookieStore = await cookies()
    const devAdmin = cookieStore.get("dev_admin_mode")
    const isEnabled = devAdmin?.value === "true"
    console.log("Dev admin mode check:", { cookieValue: devAdmin?.value, isEnabled })
    return isEnabled
  } catch (error) {
    console.error("Error reading dev admin cookie:", error)
    return false
  }
}

export async function requireAdmin() {
  const session = await auth()
  
  if (!session) {
    redirect("/login")
  }

  // Check dev mode first (development only)
  const devAdmin = await getDevAdminMode()
  if (devAdmin) {
    return session
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
  
  if (!session || !session.user?.id) {
    return false;
  }

  // Check dev mode first (development only)
  const devAdmin = await getDevAdminMode()
  if (devAdmin) {
    return true
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true, email: true },
    });

    return user?.isAdmin ?? false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

