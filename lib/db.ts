// Prisma client placeholder
// This app currently uses demo data, so Prisma is not required for production

declare global {
  var prisma: any | undefined
}

let prismaClient: any = null

try {
  // Try to dynamically import PrismaClient - only works if prisma generate was run
  const { PrismaClient } = require('@prisma/client')
  prismaClient = global.prisma || new PrismaClient()

  if (process.env.NODE_ENV !== 'production') {
    global.prisma = prismaClient
  }
} catch {
  // PrismaClient not available - app will use demo data
  prismaClient = null
}

export const prisma = prismaClient
