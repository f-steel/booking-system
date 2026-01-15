import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        scheduledDate: "desc",
      },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      customerName,
      customerEmail,
      customerPhone,
      shoeType,
      serviceType,
      scheduledDate,
      notes,
      collectionRequired,
      collectionAddress,
      collectionCity,
      collectionPostcode,
    } = body

    if (!customerName || !customerEmail || !shoeType || !serviceType || !scheduledDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // If collection is required, address fields are mandatory
    if (collectionRequired && (!collectionAddress || !collectionCity || !collectionPostcode)) {
      return NextResponse.json(
        { error: "Address, city, and postcode are required when collection is needed" },
        { status: 400 }
      )
    }

    const booking = await prisma.booking.create({
      data: {
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        shoeType,
        serviceType,
        status: "pending_confirmation",
        scheduledDate: new Date(scheduledDate),
        notes: notes || null,
        collectionRequired: collectionRequired || false,
        collectionAddress: collectionRequired ? collectionAddress : null,
        collectionCity: collectionRequired ? collectionCity : null,
        collectionPostcode: collectionRequired ? collectionPostcode : null,
        userId: session.user.id,
      },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

