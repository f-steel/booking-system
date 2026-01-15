import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile } from "fs/promises"
import { join } from "path"
import { existsSync, mkdirSync } from "fs"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const comments = await prisma.comment.findMany({
      where: {
        bookingId: id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        photos: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const formData = await request.formData()
    const message = (formData.get("message") as string) || ""
    const files = formData.getAll("photos") as File[]

    if (message.trim().length === 0 && files.length === 0) {
      return NextResponse.json(
        { error: "Message or photo is required" },
        { status: 400 }
      )
    }

    // Create comment first
    const commentMessage = message.trim() || (files.length > 0 ? "Photo" : "")
    
    const comment = await prisma.comment.create({
      data: {
        booking: {
          connect: { id }
        },
        ...(session.user.id && {
          user: {
            connect: { id: session.user.id }
          }
        }),
        message: commentMessage,
      },
    })

    // Upload photos if any
    const uploadedPhotos = []
    if (files.length > 0) {
      const uploadsDir = join(process.cwd(), "public", "uploads")
      if (!existsSync(uploadsDir)) {
        mkdirSync(uploadsDir, { recursive: true })
      }

      for (const file of files) {
        if (file.size === 0) continue

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const timestamp = Date.now()
        const filename = `comment-${comment.id}-${timestamp}-${file.name}`
        const filepath = join(uploadsDir, filename)

        await writeFile(filepath, buffer)

        const photo = await prisma.commentPhoto.create({
          data: {
            commentId: comment.id,
            url: `/uploads/${filename}`,
          },
        })

        uploadedPhotos.push(photo)
      }
    }

    // Return comment with photos and user
    const commentWithRelations = await prisma.comment.findUnique({
      where: { id: comment.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        photos: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    })

    return NextResponse.json(commentWithRelations, { status: 201 })
  } catch (error: unknown) {
    console.error("Error creating comment:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorDetails = error instanceof Error ? {
      message: error.message,
      name: error.name,
      stack: error.stack,
    } : {}
    
    console.error("Error details:", errorDetails)
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: errorMessage
      },
      { status: 500 }
    )
  }
}

