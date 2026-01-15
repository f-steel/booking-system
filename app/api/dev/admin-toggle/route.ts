import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    )
  }

  try {
    const { enabled } = await request.json()
    console.log("Setting dev admin mode to:", enabled)

    const response = NextResponse.json({ success: true, enabled })

    if (enabled) {
      response.cookies.set("dev_admin_mode", "true", {
        httpOnly: false, // Allow client-side access
        secure: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      })
      console.log("Cookie set to true")
    } else {
      response.cookies.set("dev_admin_mode", "false", {
        httpOnly: false,
        secure: false,
        sameSite: "lax",
        maxAge: 0, // Delete cookie
        path: "/",
      })
      console.log("Cookie deleted")
    }

    return response
  } catch (error) {
    console.error("Error setting dev admin cookie:", error)
    return NextResponse.json(
      { error: "Failed to toggle admin mode", details: String(error) },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    )
  }

  try {
    const cookieStore = await cookies()
    const devAdmin = cookieStore.get("dev_admin_mode")
    return NextResponse.json({ enabled: devAdmin?.value === "true" })
  } catch (error) {
    console.error("Error reading dev admin cookie:", error)
    return NextResponse.json({ enabled: false })
  }
}

