import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const getPrismaClient = () => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL is not defined in environment variables");
  }

  const url = new URL(dbUrl);
  
  const adapter = new PrismaMariaDb({
    host: url.hostname || "localhost",
    port: url.port ? parseInt(url.port) : 3306,
    user: url.username || "root",
    password: url.password || undefined,
    database: url.pathname.replace(/^\//, ""),
  });

  return new PrismaClient({ adapter });
};

export const db = globalForPrisma.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
