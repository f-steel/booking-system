import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function makeAdmin() {
  const email = process.argv[2]

  if (!email) {
    console.error("Please provide an email address")
    console.log("Usage: npx tsx scripts/make-admin.ts <email>")
    process.exit(1)
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { isAdmin: true },
    })

    console.log(`✅ User ${user.email} is now an admin!`)
  } catch (error) {
    console.error("Error:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

makeAdmin()

