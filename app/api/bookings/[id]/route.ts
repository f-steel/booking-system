import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isAdmin } from "@/lib/admin";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      shoeType,
      serviceType,
      scheduledDate,
      notes,
      status,
      collectionRequired,
      collectionAddress,
      collectionCity,
      collectionPostcode,
    } = body;

    // Check if user is admin
    const userIsAdmin = await isAdmin();

    // Admins can edit any booking, regular users can only edit their own
    const booking = await prisma.booking.findFirst({
      where: {
        id,
        ...(userIsAdmin ? {} : { userId: session.user.id }),
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // If collection is required, address fields are mandatory
    if (collectionRequired && (!collectionAddress || !collectionCity || !collectionPostcode)) {
      return NextResponse.json(
        { error: "Address, city, and postcode are required when collection is needed" },
        { status: 400 }
      )
    }

    // Non-admins can only update status and notes
    if (!userIsAdmin) {
      const updatedBooking = await prisma.booking.update({
        where: {
          id,
        },
        data: {
          status: status || booking.status,
          notes: notes || null,
        },
        include: {
          photos: true,
          comments: true,
        },
      });
      return NextResponse.json(updatedBooking);
    }

    // Admins can update all fields
    const updateData: any = {
      customerName,
      customerEmail,
      customerPhone: customerPhone || null,
      shoeType,
      serviceType,
      scheduledDate: new Date(scheduledDate),
      notes: notes || null,
      status: status || booking.status,
      collectionRequired: collectionRequired || false,
      collectionAddress: collectionRequired ? collectionAddress : null,
      collectionCity: collectionRequired ? collectionCity : null,
      collectionPostcode: collectionRequired ? collectionPostcode : null,
    };

    const updatedBooking = await prisma.booking.update({
      where: {
        id,
      },
      data: updateData,
      include: {
        photos: true,
        comments: true,
      },
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    await prisma.booking.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

