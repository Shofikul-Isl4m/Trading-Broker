import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prismaClient = globalForPrisma.prisma || new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

if (process.env.NODE_ENV != "production") globalForPrisma.prisma = prismaClient;
export type TypeOfPrismaClient = PrismaClient;
export default prismaClient;