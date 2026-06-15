import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";

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

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Administrator",
        password: passwordHash,
        role: UserRole.ADMIN,
        bio: "Default admin account",
        avatarUrl: null,
      },
    });
    console.log(`Created admin user: ${adminEmail}`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
