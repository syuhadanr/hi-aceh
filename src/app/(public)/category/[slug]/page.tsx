import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getArticlesByCategory, getTrendingArticles, getAllArticles } from "@/lib/data";
import TopBar from "@/components/layout/TopBar";
import TrendingNow from "@/components/home/TrendingNow";
import HeaderNav from '@/components/layout/HeaderNav';
import Footer from "@/components/layout/Footer";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export const revalidate = 0;
export const dynamic = "force-dynamic";

const PER_PAGE = 15;

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam || "1", 10));

  const allCategoryArticles: any[] = await getArticlesByCategory(slug);
  const trending: any[] = ((await getTrendingArticles()) || []).slice(0, 6);
  const allArticles: any[] = await getAllArticles();

  const totalArticles = allCategoryArticles.length;
  const totalPages = Math.ceil(totalArticles / PER_PAGE);
  const articles = allCategoryArticles.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const categoryMap = new Map<string, { name: string; slug: string }>();
  for (const a of allArticles) {
    if (a?.categorySlug && !categoryMap.has(a.categorySlug)) {
      categoryMap.set(a.categorySlug, { name: a.category, slug: a.categorySlug });
    }
  }
  const categories = Array.from(categoryMap.values());

  const categoryName =
    allCategoryArticles.length > 0
      ? allCategoryArticles[0].category
      : slug.charAt(0).toUpperCase() + slug.slice(1);

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen flex flex-col font-sans text-gray-900 dark:text-gray-100">
      <TopBar />
      <HeaderNav activeCategory={slug} />

      <div className="container mx-auto px-4 py-8 max-w-[1200px] flex-grow font-sans">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Sidebar — hidden */}
          <aside className="hidden"><div></div></aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Breadcrumb */}
            <div className="flex items-center text-xs text-gray-500 mb-4 font-sans uppercase tracking-wider font-bold">
              <Link href="/" className="hover:text-brand-green transition-colors">Home</Link>
              <span className="mx-2 text-gray-300">/</span>
              <span className="text-brand-green">{categoryName}</span>
            </div>
            <header className="mb-8 border-b-2 border-black dark:border-zinc-800 pb-4">
              <h1 className="text-3xl sm:text-4xl font-display font-bold uppercase text-gray-900 dark:text-white">
                <span className="text-brand-green">RUBRIK</span> {categoryName}
              </h1>
            </header>

            <div className="flex flex-col">
              {articles.length > 0 ? (
                articles.map((article) => (
                  <article key={article.id} className="group">

                    {/* Mobile: NYPost-style compact row */}
                    <Link
                      href={`/article/${article.slug}`}
                      className="sm:hidden flex items-center gap-3 py-3 border-b border-zinc-100 dark:border-zinc-800"
                    >
                      <div className="flex flex-col flex-1 min-w-0 gap-1">
                        <h2 className="font-bold text-sm leading-snug text-zinc-900 dark:text-white line-clamp-3 transition-colors group-hover:text-brand-green">
                          {article.title}
                        </h2>
                        <span className="text-[10px] text-zinc-400">
                          {article.publishedAt}
                        </span>
                      </div>
                      <div className="relative w-20 h-14 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-900">
                        <Image
                          src={article.image}
                          alt={article.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>

                    {/* Desktop: original card */}
                    <div className="hidden sm:flex gap-5 bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-4 mb-4 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="relative w-52 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900 aspect-[4/3]">
                        <Image
                          src={article.image}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-3 left-3 bg-zinc-950/80 text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded backdrop-blur-sm">
                          {article.category}
                        </span>
                      </div>
                      <div className="flex flex-col flex-1 justify-between py-1 gap-2">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[11px] font-semibold text-brand-green uppercase tracking-wider">
                            {article.author}
                          </span>
                          <Link href={`/article/${article.slug}`}>
                            <h2 className="font-bold text-xl sm:text-2xl leading-snug group-hover:text-primary text-zinc-900 dark:text-white line-clamp-2 transition-colors">
                              {article.title}
                            </h2>
                          </Link>
                          {article.excerpt ? (
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm line-clamp-2 mt-1">
                              {article.excerpt}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-500 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                          <span>{article.publishedAt}</span>
                        </div>
                      </div>
                    </div>

                  </article>
                ))
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800">
                  <svg className="w-10 h-10 text-gray-300 dark:text-zinc-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
                  </svg>
                  <p className="text-gray-500 dark:text-zinc-400 italic">
                    Belum ada berita di kategori {categoryName}.
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <>
                {/* Mobile pagination: windowed with ellipsis */}
                {(() => {
                  const pages: (number | "...")[] = [];
                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    if (currentPage > 3) pages.push("...");
                    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
                    if (currentPage < totalPages - 2) pages.push("...");
                    pages.push(totalPages);
                  }
                  return (
                    <div className="sm:hidden flex items-center justify-center gap-1 mt-8 flex-wrap">
                      {currentPage > 1 ? (
                        <Link href={`/category/${slug}?page=${currentPage - 1}`} className="flex items-center px-3 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                          ←
                        </Link>
                      ) : (
                        <span className="flex items-center px-3 py-2 text-sm font-semibold text-zinc-300 dark:text-zinc-600 border border-zinc-100 dark:border-zinc-800 rounded-xl cursor-not-allowed">←</span>
                      )}
                      {pages.map((p, i) =>
                        p === "..." ? (
                          <span key={`ellipsis-${i}`} className="w-8 h-9 flex items-center justify-center text-sm text-zinc-400 dark:text-zinc-500">…</span>
                        ) : (
                          <Link key={p} href={`/category/${slug}?page=${p}`}
                            className={`w-9 h-9 flex items-center justify-center text-sm font-bold rounded-xl transition-colors ${p === currentPage ? "bg-brand-green text-white" : "text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
                          >{p}</Link>
                        )
                      )}
                      {currentPage < totalPages ? (
                        <Link href={`/category/${slug}?page=${currentPage + 1}`} className="flex items-center px-3 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                          →
                        </Link>
                      ) : (
                        <span className="flex items-center px-3 py-2 text-sm font-semibold text-zinc-300 dark:text-zinc-600 border border-zinc-100 dark:border-zinc-800 rounded-xl cursor-not-allowed">→</span>
                      )}
                    </div>
                  );
                })()}

                {/* Desktop pagination: full page numbers */}
                <div className="hidden sm:flex items-center justify-center gap-2 mt-10 flex-wrap">
                  {currentPage > 1 ? (
                    <Link href={`/category/${slug}?page=${currentPage - 1}`} className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                      ← Prev
                    </Link>
                  ) : (
                    <span className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-zinc-300 dark:text-zinc-600 border border-zinc-100 dark:border-zinc-800 rounded-xl cursor-not-allowed">← Prev</span>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link key={p} href={`/category/${slug}?page=${p}`} className={`w-9 h-9 flex items-center justify-center text-sm font-bold rounded-xl transition-colors ${p === currentPage ? "bg-brand-green text-white" : "text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}>
                      {p}
                    </Link>
                  ))}
                  {currentPage < totalPages ? (
                    <Link href={`/category/${slug}?page=${currentPage + 1}`} className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                      Next →
                    </Link>
                  ) : (
                    <span className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-zinc-300 dark:text-zinc-600 border border-zinc-100 dark:border-zinc-800 rounded-xl cursor-not-allowed">Next →</span>
                  )}
                </div>
              </>
            )}
          </main>

          {/* Right Sidebar */}
          <aside className="w-full lg:w-[32%] flex flex-col justify-end mt-8 lg:mt-0">
            <div className="lg:sticky lg:bottom-0 flex flex-col gap-8 pb-8">
              <TrendingNow articles={trending} />

              {/* Berita Terbaru */}
              <div className="bg-white dark:bg-zinc-950">
                <h3 className="flex items-center gap-2 text-lg font-bold uppercase border-l-4 border-brand-green pl-3 mb-6 font-display text-gray-900 dark:text-white">
                  Berita Terbaru
                </h3>
                <div className="flex flex-col gap-6">
                  {articles.slice(0, 6).map((a, idx) => (
                    <Link key={a.id} href={`/article/${a.slug}`} className="flex gap-4 group">
                      <div className="relative w-24 h-20 shrink-0 bg-gray-100 dark:bg-zinc-800 rounded overflow-hidden">
                        <Image src={a.image} alt={a.title} fill className="object-cover" />
                        <div className="absolute top-0 left-0 bg-brand-green text-white text-[10px] font-bold px-1.5 py-0.5">{idx + 1}</div>
                      </div>
                      <div className="flex flex-col justify-between py-0.5">
                        <span className="text-[10px] uppercase font-bold text-brand-green tracking-wider font-sans">{a.category}</span>
                        <h4 className="font-bold text-sm leading-snug text-gray-900 dark:text-white group-hover:text-brand-green transition-colors font-sans line-clamp-2">{a.title}</h4>
                        <span className="text-[10px] text-gray-400 font-sans">{a.publishedAt}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>
      <Footer />
    </div>
  );
}