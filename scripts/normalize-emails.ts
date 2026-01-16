import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function normalizeEmails() {
  try {
    console.log("Fetching all users...")
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
      },
    })

    console.log(`Found ${users.length} users`)

    for (const user of users) {
      const normalizedEmail = user.email.trim().toLowerCase()
      
      if (user.email !== normalizedEmail) {
        console.log(`Updating ${user.email} -> ${normalizedEmail}`)
        
        // Check if normalized email already exists
        const existing = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        })

        if (existing && existing.id !== user.id) {
          console.log(`⚠️  Skipping ${user.email}: normalized email ${normalizedEmail} already exists for another user`)
          continue
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { email: normalizedEmail },
        })
        
        console.log(`✅ Updated user ${user.id}`)
      } else {
        console.log(`✓ ${user.email} is already normalized`)
      }
    }

    console.log("✅ Email normalization complete!")
  } catch (error) {
    console.error("Error normalizing emails:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

normalizeEmails()


