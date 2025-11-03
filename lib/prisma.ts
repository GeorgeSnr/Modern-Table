// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// Avoid creating multiple instances in development (Next.js hot reload)
const globalForPrisma = global as typeof globalThis & { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "error", "warn"], // optional: helps debug queries
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
