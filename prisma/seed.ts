import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("DATABASE_URL must be set to run the seed script.");
}

const url = new URL(dbUrl);
const adapter = new PrismaMariaDb({
  host: url.hostname || "localhost",
  port: url.port ? parseInt(url.port, 10) : 3306,
  user: url.username || "root",
  password: url.password || undefined,
  database: url.pathname.replace(/^\//, ""),
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.category.upsert({
    where: { slug: "uncategorized" },
    update: {},
    create: {
      name: "Uncategorized",
      slug: "uncategorized",
      description: "Default category",
    },
  });

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Administrator",
      password: passwordHash,
      role: "ADMIN",
      bio: "Default admin user",
    },
    create: {
      email: adminEmail,
      name: "Administrator",
      password: passwordHash,
      role: "ADMIN",
      bio: "Default admin user",
    },
  });

  console.log(`Admin seeded: ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });