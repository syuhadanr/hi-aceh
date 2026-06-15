import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

const url = new URL(dbUrl);
const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({
    host: url.hostname || "localhost",
    port: url.port ? parseInt(url.port) : 3306,
    user: url.username || "root",
    password: url.password || undefined,
    database: url.pathname.replace(/^\//, ""),
  }),
});

async function main() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });
  console.log("categories:");
  for (const category of categories) {
    const count = await prisma.article.count({
      where: { categoryId: category.id, status: "PUBLISHED", deletedAt: null },
    });
    console.log(`- ${category.name} (${category.slug}): ${count}`);
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
