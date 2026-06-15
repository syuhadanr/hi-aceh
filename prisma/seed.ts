import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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