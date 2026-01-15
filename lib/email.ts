/**
 * Email sending utility
 * For production, configure SMTP or use a service like Resend, SendGrid, etc.
 */

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  // In development, log the email instead of sending
  if (process.env.NODE_ENV === "development") {
    console.log("=".repeat(60))
    console.log("📧 EMAIL (Development Mode - Not Sent)")
    console.log("=".repeat(60))
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log("-".repeat(60))
    console.log(text || html)
    console.log("=".repeat(60))
    return { success: true }
  }

  // For production, use an email service
  // Example with Resend (uncomment and configure):
  /*
  const RESEND_API_KEY = process.env.RESEND_API_KEY
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured")
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "FK Trainers <noreply@fktrainers.com>",
      to,
      subject,
      html,
      text,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to send email: ${error.message}`)
  }

  return await response.json()
  */

  // For SMTP (using nodemailer - install: npm install nodemailer)
  /*
  const nodemailer = require("nodemailer")
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })

  return await transporter.sendMail({
    from: process.env.EMAIL_FROM || "FK Trainers <noreply@fktrainers.com>",
    to,
    subject,
    html,
    text,
  })
  */

  // Fallback: log in production if no email service configured
  console.log("Email service not configured. Email would be sent to:", to)
  console.log("Subject:", subject)
  return { success: true }
}

export function getPasswordResetEmailHtml(token: string, resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">FK Trainers</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
          <p>You requested to reset your password for your FK Trainers account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
          </div>
          <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="color: #667eea; word-break: break-all; font-size: 14px;">${resetUrl}</p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">This link will expire in 1 hour.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
      </body>
    </html>
  `
}

export function getPasswordResetEmailText(token: string, resetUrl: string): string {
  return `
Reset Your Password - FK Trainers

You requested to reset your password for your FK Trainers account.

Click this link to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.
  `.trim()
}

