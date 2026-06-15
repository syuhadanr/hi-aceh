import { db } from "./db";

export const revalidate = 0;
export const dynamic = "force-dynamic";

function getYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : "";
}

const CATEGORY_SLUG_MAP: Record<string, string> = {
  politics: "politik",
  economy: "ekonomi",
  culture: "budaya",
  tourism: "wisata",
};

const CATEGORY_NAME_MAP: Record<string, string> = {
  politik: "Politik",
  ekonomi: "Ekonomi",
  budaya: "Budaya",
  wisata: "Wisata",
};

type PrismaArticle = {
  id?: string;
  slug?: string;
  title?: string;
  excerpt?: string;
  content?: string;
  publishedAt?: string;
  type?: string;
  videoUrl?: string;
  isBreaking?: boolean;
  isFeatured?: boolean;
  featuredImage?: { url?: string };
  category?: { slug?: string; name?: string };
  author?: { name?: string };
};

export function mapPrismaArticle(article: any) {
  if (!article) return null;
  console.log("article.type:", article.type, "article.videoUrl:", article.videoUrl);

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const publishedStr = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-US", dateOptions)
    : "";

  let imageUrl = "https://picsum.photos/seed/" + encodeURIComponent(article.title || "news") + "/800/600";
  if (article.featuredImage?.url) {
    imageUrl = article.featuredImage.url;
  } else if (article.type === "VIDEO" && article.videoUrl) {
    const ytid = getYouTubeId(article.videoUrl);
    if (ytid) {
      imageUrl = `https://img.youtube.com/vi/${ytid}/maxresdefault.jpg`;
    }
  }

  // Parse content based on type
  let content = article.content || "";
  let carousel: { url: string; caption: string }[] = [];

  if (article.type === "FOTO") {
    try {
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === "object" && "carousel" in parsed) {
        carousel = parsed.carousel || [];
        content = parsed.body || "";
        // Use first carousel image as the article thumbnail
        if (carousel.length > 0 && !article.featuredImage?.url) {
          imageUrl = carousel[0].url;
        }
      }
    } catch {
      // content is plain HTML, leave as-is
    }
  }

  const excerpt = article.excerpt || "";
  const dbSlug = article.category?.slug || "news";
  const mappedSlug = CATEGORY_SLUG_MAP[dbSlug.toLowerCase()] || dbSlug;
  const mappedName = CATEGORY_NAME_MAP[dbSlug.toLowerCase()] || article.category?.name || "Berita";

  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: excerpt,
    content: content,
    carousel: carousel,
    type: article.type || "TEKS",
    category: mappedName,
    categorySlug: mappedSlug,
    author: article.author?.name || "Staff Writer",
    publishedAt: publishedStr,
    image: imageUrl,
    videoUrl: article.videoUrl || null,
    isBreaking: article.isBreaking || false,
    isFeatured: article.isFeatured || false,
    isTrending: false,
  };
}

export async function getAllArticles() {
  const articles = await db.article.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    orderBy: { publishedAt: "desc" },
    include: { author: true, category: true, tags: true, featuredImage: true },
  });
  return articles.map(mapPrismaArticle).filter(Boolean);
}

export async function getArticleBySlug(slug: string) {
  const article = await db.article.findFirst({
    where: { slug, status: "PUBLISHED", deletedAt: null },
    include: { author: true, category: true, tags: true, featuredImage: true },
  });
  return mapPrismaArticle(article);
}

export async function getArticlesByCategory(categorySlug: string) {
  const mappedSlug = CATEGORY_SLUG_MAP[categorySlug.toLowerCase()] || categorySlug;
  const articles = await db.article.findMany({
    where: { category: { slug: mappedSlug.toLowerCase() }, status: "PUBLISHED", deletedAt: null },
    orderBy: { publishedAt: "desc" },
    include: { author: true, category: true, tags: true, featuredImage: true },
  });
  return articles.map(mapPrismaArticle).filter(Boolean);
}

export async function getTrendingArticles() {
  const articles = await db.article.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    orderBy: { viewCount: "desc" },
    take: 6,
    include: { author: true, category: true, tags: true, featuredImage: true },
  });
  return articles.map(mapPrismaArticle).filter(Boolean);
}

export async function getFeaturedArticles() {
  const articles = await db.article.findMany({
    where: { isFeatured: true, status: "PUBLISHED", deletedAt: null },
    orderBy: { publishedAt: "desc" },
    include: { author: true, category: true, tags: true, featuredImage: true },
  });
  return articles.map(mapPrismaArticle).filter(Boolean);
}

export async function getRelatedArticles(categoryName: string, currentSlug: string) {
  const articles = await db.article.findMany({
    where: { category: { name: categoryName }, slug: { not: currentSlug }, status: "PUBLISHED", deletedAt: null },
    orderBy: { publishedAt: "desc" },
    take: 12,
    include: { author: true, category: true, tags: true, featuredImage: true },
  });
  return articles.map(mapPrismaArticle).filter(Boolean);
}