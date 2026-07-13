import { db } from "./db";

export async function publishDueScheduledArticles() {
  const now = new Date();

  const dueArticles = await db.article.findMany({
    where: {
      status: "SCHEDULED",
      publishedAt: { lte: now },
      deletedAt: null,
    },
    select: { id: true },
  });

  if (dueArticles.length === 0) {
    return { published: 0, ids: [] as string[] };
  }

  await db.article.updateMany({
    where: {
      id: { in: dueArticles.map((article) => article.id) },
      status: "SCHEDULED",
      publishedAt: { lte: now },
      deletedAt: null,
    },
    data: {
      status: "PUBLISHED",
    },
  });

  return { published: dueArticles.length, ids: dueArticles.map((article) => article.id) };
}
