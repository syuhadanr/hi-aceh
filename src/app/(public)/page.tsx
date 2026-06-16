import React from "react";
import TopBar from "@/components/layout/TopBar";
import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";
import BreakingNews from "@/components/home/BreakingNews";
import EditorsPicks from "@/components/home/EditorsPicks";
import MainNews from "@/components/home/MainNews";
import TrendingNow from "@/components/home/TrendingNow";
import FeaturedPosts from "@/components/home/FeaturedPosts";
import FeaturedBriefs from "@/components/home/FeaturedBriefs";
import ExpressPosts from "@/components/home/ExpressPosts";
import HeaderNav from '@/components/layout/HeaderNav';
import PopularWidget from "@/components/home/PopularWidget";
import Footer from "@/components/layout/Footer";
import { getAllArticles, getTrendingArticles } from "@/lib/data";
import AdSlot from "@/components/ads/AdSlot";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function Home() {
  const articles = (await getAllArticles()) as any[];

  // If there are too few real articles (dev/testing), append 10 dummy articles
  if (!articles || articles.length < 10) {
    const now = new Date();
    const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const publishedStr = now.toLocaleDateString('en-US', dateOptions);
    const dummyCount = 10;
    for (let i = 0; i < dummyCount; i++) {
      (articles as any).push({
        id: `dummy-${i}`,
        slug: `dummy-${i}`,
        title: `Dummy Article ${i + 1}`,
        excerpt: `Placeholder story ${i + 1} for layout/testing.`,
        content: `Placeholder content ${i + 1}`,
        publishedAt: publishedStr,
        image: `https://picsum.photos/seed/dummy${i}/800/600`,
        category: 'Berita',
        categorySlug: 'berita',
        author: 'Redaksi',
        carousel: [],
        type: 'TEKS',
        videoUrl: null,
        isBreaking: false,
        isFeatured: false,
        isTrending: false,
      });
    }
  }

  // Handle empty state gracefully
  if (!articles || articles.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex flex-col font-sans">
        <TopBar />
        <HeaderNav activeCategory={null} />

        <div className="container mx-auto px-4 py-16 flex-grow flex flex-col items-center justify-center text-center">
          <div className="bg-white dark:bg-zinc-800 p-8 rounded-lg shadow-sm border border-gray-100 dark:border-zinc-700 max-w-md">
            <i className="material-icons text-6xl text-gray-400 dark:text-zinc-500 mb-4">newspaper</i>
            <h2 className="text-2xl font-display font-bold text-gray-800 dark:text-white mb-2">
              Belum Ada Berita
            </h2>
            <p className="text-gray-500 dark:text-zinc-400 text-sm leading-relaxed mb-6">
              Saat ini belum ada artikel berita yang dipublikasikan. Silakan kembali lagi nanti atau login ke dashboard admin untuk menulis berita baru.
            </p>
            <a
              href="/admin/login"
              className="inline-block bg-primary hover:bg-primary-dark text-white font-bold text-xs uppercase px-6 py-3 rounded transition-colors"
            >
              Tulis Berita
            </a>
          </div>
        </div>

        <Footer />
      </main>
    );
  }

  // Helper filters
  const featuredArticles = articles.filter((a) => a.isFeatured);
  const regularArticles = articles.filter((a) => !a.isFeatured);
  const heroArticles = [...featuredArticles, ...regularArticles].slice(0, 5);

  const editorsPicks = articles.slice(1, 5);
  const trending = await getTrendingArticles();
  const featured = articles.slice(0, 20);

  const seen = new Set();
  const popularList = [];
  for (const a of [...(trending || []), ...(featured || [])]) {
    if (!a || !a.slug) continue;
    if (seen.has(a.slug)) continue;
    seen.add(a.slug);
    popularList.push(a);
    if (popularList.length >= 12) break;
  }

  const minPopular = 12;
  if (popularList.length < minPopular) {
    const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const publishedFallback = new Date().toLocaleDateString('en-US', dateOptions);
    let dummyIdx = 0;
    while (popularList.length < minPopular) {
      (popularList as any).push({
        id: `popular-dummy-${dummyIdx}`,
        slug: `popular-dummy-${dummyIdx}`,
        title: `More: Placeholder story ${dummyIdx + 1}`,
        excerpt: `Placeholder for layout/testing.`,
        content: '',
        publishedAt: publishedFallback,
        image: `https://picsum.photos/seed/popular${dummyIdx}/400/300`,
        category: 'Berita',
        categorySlug: 'berita',
        author: 'Redaksi',
        carousel: [],
        type: 'TEKS',
        videoUrl: null,
        isBreaking: false,
        isFeatured: false,
        isTrending: false,
      });
      dummyIdx++;
    }
  }

  const settingsRes = await fetch(new URL("/api/settings", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"), { cache: "no-store" });
  const settings = settingsRes.ok
    ? await settingsRes.json()
    : { featuredBriefsCategory: "politik", navbarCategories: [] };
  const featuredBriefsCategory = settings.featuredBriefsCategory || "politik";

  const featuredBriefsArticles = articles.filter(
    (a) =>
      a.categorySlug === featuredBriefsCategory ||
      a.category?.toLowerCase() === featuredBriefsCategory
  );

  const featuredBriefsTitle =
    featuredBriefsArticles[0]?.category ||
    featuredBriefsCategory.charAt(0).toUpperCase() + featuredBriefsCategory.slice(1);

  const visibleNavbarSlugs = (settings.navbarCategories || [])
    .filter((cat) => cat.visible)
    .map((cat) => cat.slug);

  const categorySourceSlugs = visibleNavbarSlugs.length > 0
    ? visibleNavbarSlugs
    : Array.from(new Set(articles.map((a) => a.categorySlug)));

  const categoryWidgets = categorySourceSlugs.slice(0, 8).map((slug) => {
    const categoryArticles = articles.filter((a) => a.categorySlug === slug);
    const categoryNameFromSettings = (settings.navbarCategories || []).find((cat) => cat.slug === slug)?.name;
    return {
      slug,
      title:
        categoryArticles[0]?.category ||
        categoryNameFromSettings ||
        slug.charAt(0).toUpperCase() + slug.slice(1),
      image:
        categoryArticles[0]?.image ||
        `https://picsum.photos/seed/${slug}/1200/800`,
      articles: categoryArticles.slice(0, 4),
    };
  });

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col font-sans">
      <TopBar />
      <HeaderNav activeCategory={null} />

      <BreakingNews />

      <div className="w-full max-w-screen-2xl mx-auto px-4 py-8 flex-grow">

        {/* Top Section: Editors Picks, Main News, Trending */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 mb-12">
          {/* Desktop only: Editors Picks left column */}
          <div className="hidden lg:block lg:col-span-3">
            <EditorsPicks articles={editorsPicks} />
          </div>

          {/* Main carousel — always first on mobile */}
          <div className="lg:col-span-6 order-1 lg:order-none">
            <MainNews articles={heroArticles} />
          </div>

          {/* Mobile only: Berita Terbaru (FeaturedPosts) appears after carousel */}
          <div className="block lg:hidden order-2">
            <FeaturedPosts articles={featured.slice(0, 20)} />
          </div>

          {/* Trending — after Berita Terbaru on mobile, right column on desktop */}
          <div className="lg:col-span-3 order-3 lg:order-none">
            <TrendingNow articles={trending} />
          </div>
        </div>

        {/* Featured Posts + Popular widget — desktop only */}
        <div className="mb-12 flex flex-col-reverse lg:grid lg:grid-cols-12 gap-6 items-stretch">
          <div className="hidden lg:block lg:col-span-8">
            <FeaturedPosts articles={featured.slice(0, 6)} />
          </div>
          <div className="hidden lg:block lg:col-span-4">
            <PopularWidget articles={popularList} />
          </div>
        </div>

        {/* Featured Briefs Section */}
        <div className="mb-12">
          <FeaturedBriefs
            articles={featuredBriefsArticles}
            categoryName={featuredBriefsTitle}
            categorySlug={featuredBriefsCategory}
          />
        </div>

        {/* Category widgets */}
        <div className="mb-12">
          <ExpressPosts categories={categoryWidgets} />
        </div>
      </div>

      <Footer />
    </main>
  );
}