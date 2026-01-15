import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail, getPasswordResetEmailHtml, getPasswordResetEmailText } from "@/lib/email"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase()

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      // Generate reset token
      const token = crypto.randomBytes(32).toString("hex")
      const expires = new Date()
      expires.setHours(expires.getHours() + 1) // Token expires in 1 hour

      // Delete any existing reset tokens for this user
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      })

      // Create new reset token
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expires,
        },
      })

      // Generate reset URL
      const baseUrl = process.env.NEXTAUTH_URL || 
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
        "http://localhost:3000"
      const resetUrl = `${baseUrl}/reset-password?token=${token}`

      // Send email
      try {
        await sendEmail({
          to: user.email,
          subject: "Reset Your Password - FK Trainers",
          html: getPasswordResetEmailHtml(token, resetUrl),
          text: getPasswordResetEmailText(token, resetUrl),
        })
      } catch (emailError) {
        console.error("Error sending password reset email:", emailError)
        // Don't fail the request if email fails
      }
    }

    // Always return success message
    return NextResponse.json({
      message: "If an account with that email exists, we've sent a password reset link.",
    })
  } catch (error) {
    console.error("Error in forgot password:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

