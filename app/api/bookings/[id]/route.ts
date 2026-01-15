import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      status,
    } = body

    const booking = await prisma.booking.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const updatedBooking = await prisma.booking.update({
      where: {
        id: params.id,
      },
      data: {
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        shoeType,
        serviceType,
        scheduledDate: new Date(scheduledDate),
        notes: notes || null,
        status: status || booking.status,
      },
    })

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    await prisma.booking.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: "Booking deleted successfully" })
  } catch (error) {
    console.error("Error deleting booking:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

