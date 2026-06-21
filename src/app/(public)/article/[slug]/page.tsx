import React from "react";
import Image from "next/image";
import { getArticleBySlug, getRelatedArticles, getTrendingArticles, getAllArticles } from "@/lib/data";
import { notFound } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import HeaderNav from "@/components/layout/HeaderNav";
import TrendingNow from "@/components/home/TrendingNow";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import CommentSection from "@/components/article/CommentSection";
import PhotoCarousel from "@/components/article/PhotoCarousel";
import { db } from "@/lib/db";
import Link from "next/link";
import AdSlot, { SidebarAds } from "@/components/ads/AdSlot";
import ViewTracker from "@/components/article/ViewTracker";
import ViewCounter from "@/components/article/ViewCounter";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article: any = await getArticleBySlug(slug);

  if (!article) {
    return { title: "Artikel tidak ditemukan" };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://hiaceh.id";
  const articleUrl = `${baseUrl}/article/${slug}`;
  const imageUrl = article.image?.startsWith("http")
    ? article.image
    : `${baseUrl}${article.image}`;

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: articleUrl,
      siteName: "Hi Aceh",
      type: "article",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [imageUrl],
    },
  };
}

function getYouTubeEmbedUrl(url: string): string {
  const match = url.match(/(?:youtu\.be\/|watch\?v=|embed\/)([^&?/]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article: any = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(article.category, slug);
  const trendingArticles = (await getTrendingArticles()).slice(0, 6);
  const latestArticles = (await getAllArticles()).slice(0, 6);

  const commentCount = await db.comment.count({
    where: { articleId: article.id, isApproved: true },
  });

  const settings = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/settings`)
    .then(r => r.ok ? r.json() : null)
    .catch(() => null);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const articleUrl = `${baseUrl}/article/${slug}`;

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen flex flex-col font-sans text-gray-900 dark:text-gray-100">
      <TopBar />
      <HeaderNav activeCategory={article.categorySlug} />


      <ViewTracker slug={slug} />
      <div className="container mx-auto px-4 py-8 max-w-[1200px] flex-grow font-sans">
        {/* Breadcrumb */}
        <div className="flex items-center text-xs text-gray-500 mb-6 font-sans uppercase tracking-wider font-bold">
          <a href="/" className="hover:text-brand-green transition-colors">Home</a>
          <span className="mx-2 text-gray-300">/</span>
          <a href={`/category/${article.categorySlug}`} className="hover:text-brand-green transition-colors">
            {article.category}
          </a>
          <span className="mx-2 text-gray-300">/</span>
          <span className="text-gray-400 truncate max-w-[300px] normal-case font-medium">
            {article.title}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content Column */}
          <main className="lg:w-[68%]">
            {/* Article Header */}
            <header className="mb-8">
              <span className="inline-block bg-brand-green text-white text-[10px] font-bold px-2 py-1 mb-3 uppercase tracking-widest font-sans">
                {article.category}
              </span>
              <AdSlot position="ARTICLE_ABOVE_TITLE" className="mb-4" />
              <AdSlot position="MOBILE_ARTICLE_ABOVE" className="mb-4" />
              <h1 className="text-2xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-2 leading-tight">  {article.title}
              </h1>
              <p className="text-base text-gray-600 dark:text-zinc-400 font-sans leading-relaxed mb-4">
                {article.excerpt}
              </p>
              {/* Desktop meta row */}
              <div className="hidden sm:flex items-center justify-between border-t border-b border-gray-100 dark:border-zinc-800 py-4 font-sans text-xs text-gray-500">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-zinc-800">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(article.author)}&background=187957&color=fff`}
                        alt={article.author}
                      />
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white uppercase">
                      {article.author}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <i className="material-icons text-sm">calendar_today</i>
                    <span>{article.publishedAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <i className="material-icons text-sm text-gray-400">visibility</i>{" "}
                    <ViewCounter slug={slug} />
                  </span>
                </div>
              </div>

              {/* Mobile meta row */}
              <div className="sm:hidden border-t border-b border-gray-100 dark:border-zinc-800 py-2 font-sans text-xs text-gray-500 flex flex-row items-center gap-3">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 dark:bg-zinc-800 shrink-0">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(article.author)}&background=187957&color=fff`}
                    alt={article.author}
                  />
                </div>
                <span className="font-bold text-gray-900 dark:text-white uppercase text-[10px]">{article.author}</span>
                <span className="text-gray-300">·</span>
                <span className="flex items-center gap-1">
                  <i className="material-icons text-xs">calendar_today</i>
                  {article.publishedAt}
                </span>
                <span className="text-gray-300">·</span>
                <span className="text-[10px] text-gray-400">
                  {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                </span>
              </div>
            </header>

            {/* Featured Image / Carousel / Video */}
            {article.type === "VIDEO" && article.videoUrl ? (
              <div className="relative w-full mb-8 rounded overflow-hidden bg-black" style={{ paddingTop: '56.25%' }}>
                <iframe
                  src={getYouTubeEmbedUrl(article.videoUrl)}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            ) : article.type === "FOTO" && article.carousel?.length > 0 ? (
              <PhotoCarousel photos={article.carousel} />
            ) : (
              <figure className="relative w-full mb-8">
                <Image
                  src={article.image}
                  alt={article.title}
                  width={1200}
                  height={800}
                  className="w-full h-auto object-contain bg-gray-100 dark:bg-zinc-800"
                  priority
                />
                <figcaption className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 text-white text-xs font-sans">
                  © 2024 Hi Aceh Media. Foto ilustrasi.
                </figcaption>
              </figure>
            )}

            <AdSlot position="ARTICLE_BELOW_IMAGE" className="mb-8" />

            {/* Article Body */}
            {article.content && (() => {
              const htmlContent = article.content;
              const paragraphs = htmlContent.split("</p>");
              if (paragraphs.length <= 2) {
                return (
                  <div className="prose prose-lg max-w-none text-gray-800 dark:text-zinc-300 dark:prose-invert font-sans leading-loose mb-12">
                    <div
                      dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                  </div>
                );
              }
              const splitIndex = paragraphs.length >= 4 ? 2 : Math.floor(paragraphs.length / 2);
              const part1 = paragraphs.slice(0, splitIndex).join("</p>") + "</p>";
              const part2 = paragraphs.slice(splitIndex).join("</p>");

              return (
                <div className="prose prose-lg max-w-none text-gray-800 dark:text-zinc-300 dark:prose-invert font-sans leading-loose mb-12">
                  <div
                    dangerouslySetInnerHTML={{ __html: part1 }}
                  />
                  <AdSlot position="ARTICLE_IN_CONTENT" className="my-8" />
                  <AdSlot position="MOBILE_ARTICLE_MIDDLE" className="my-8" />
                  <div dangerouslySetInnerHTML={{ __html: part2 }} />
                </div>
              );
            })()}

            <AdSlot position="ARTICLE_END" className="mb-8" />
            <AdSlot position="MOBILE_ARTICLE_END" className="mb-8" />

            {/* Tags & Share */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 dark:bg-zinc-900 p-4 border-l-4 border-brand-green mb-12 font-sans gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-white uppercase flex-wrap">
                <span>Tags:</span>
                <a href="#" className="text-gray-500 hover:text-brand-green transition-colors">#Aceh</a>
                <a href="#" className="text-gray-500 hover:text-brand-green transition-colors">#News</a>
                <a href="#" className="text-gray-500 hover:text-brand-green transition-colors">#{article.category}</a>
              </div>
              <div className="flex gap-2 shrink-0">
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`} target="_blank" rel="noopener noreferrer" className="bg-[#3b5998] text-white w-9 h-9 rounded flex items-center justify-center hover:opacity-90">
                  <i className="material-icons text-sm">facebook</i>
                </a>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(articleUrl)}`} target="_blank" rel="noopener noreferrer" className="bg-black text-white w-9 h-9 rounded flex items-center justify-center hover:opacity-90">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.846L2.25 2.25h6.672l4.26 5.631 5.062-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                  </svg>
                </a>
                <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + articleUrl)}`} target="_blank" rel="noopener noreferrer" className="bg-[#25D366] text-white w-9 h-9 rounded flex items-center justify-center hover:opacity-90">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>

              </div>
            </div>

            <CommentSection articleId={article.id} initialCount={commentCount} />
          </main>

          {/* Sidebar — matches category page sticky style */}
          <aside className="lg:w-[32%] flex flex-col justify-end">
            <div className="lg:sticky lg:bottom-0 flex flex-col gap-8 pb-8">

              {/* Terpopuler Widget */}
              <TrendingNow articles={trendingArticles} />

              {/* Sidebar Ad Slots */}
              <SidebarAds />

              {/* Mobile Ad between Trending and Berita Terbaru */}
              <AdSlot position="MOBILE_FEED_AFTER" className="my-4" />

              {/* Berita Terbaru Widget */}
              <div className="bg-white dark:bg-zinc-950">
                <h3 className="flex items-center gap-2 text-lg font-bold uppercase border-l-4 border-brand-green pl-3 mb-6 font-display text-gray-900 dark:text-white">
                  Berita Terbaru
                </h3>
                <div className="flex flex-col gap-6">
                  {latestArticles.map((post: any, idx: number) => (
                    <a key={post.id} href={`/article/${post.slug}`} className="flex gap-4 group">
                      <div className="relative w-24 h-20 shrink-0 bg-gray-100 dark:bg-zinc-800 rounded overflow-hidden">
                        <Image src={post.image} alt={post.title} fill className="object-cover" />
                      </div>
                      <div className="flex flex-col justify-between py-0.5">
                        <span className="text-[10px] uppercase font-bold text-brand-green tracking-wider font-sans">
                          {post.category}
                        </span>
                        <h4 className="font-bold text-sm leading-snug text-gray-900 dark:text-white group-hover:text-brand-green transition-colors font-sans">
                          {post.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-sans">{post.publishedAt}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Ikuti Kami */}
              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold uppercase border-l-4 border-brand-green pl-3 mb-6 font-display text-gray-900 dark:text-white">
                  Ikuti Kami
                </h3>
                <div className="grid grid-cols-2 gap-2 font-sans text-xs font-bold text-white uppercase">
                  <a href={settings?.socialFacebook || "#"} target="_blank" rel="noopener noreferrer" className="bg-[#3b5998] py-3 flex items-center justify-center gap-2 hover:opacity-90 rounded transition-opacity">
                    <i className="material-icons text-sm">facebook</i>
                    <span>Facebook</span>
                  </a>
                  <a href={settings?.socialTwitter || "#"} target="_blank" rel="noopener noreferrer" className="bg-black py-3 flex items-center justify-center gap-2 hover:opacity-90 rounded transition-opacity">
                    <i className="material-icons text-sm">flutter_dash</i>
                    <span>X / Twitter</span>
                  </a>
                  <a href={settings?.socialInstagram || "#"} target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 py-3 flex items-center justify-center gap-2 hover:opacity-90 rounded transition-opacity">
                    <i className="material-icons text-sm">camera_alt</i>
                    <span>Instagram</span>
                  </a>
                  <a href={settings?.socialYoutube || "#"} target="_blank" rel="noopener noreferrer" className="bg-[#FF0000] py-3 flex items-center justify-center gap-2 hover:opacity-90 rounded transition-opacity">
                    <i className="material-icons text-sm">play_arrow</i>
                    <span>YouTube</span>
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Related News */}
        <div className="mt-16 border-t border-gray-200 dark:border-zinc-800 pt-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold uppercase font-display border-l-4 border-brand-green pl-4 text-gray-900 dark:text-white">
              Berita Terkait
            </h3>
            <a
              href={`/category/${article.categorySlug}`}
              className="text-xs font-bold uppercase tracking-wider text-brand-green hover:underline flex items-center gap-1"
            >
              Selengkapnya <i className="material-icons text-sm">arrow_forward</i>
            </a>
          </div>
          {relatedArticles.length === 0 ? (
            <p className="text-sm text-gray-500 italic">Belum ada berita terkait.</p>
          ) : (
            <>
              {/* Mobile: horizontal scroll, ~2 cards visible */}
              <div className="sm:hidden flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
                {relatedArticles.map((post: any) => (
                  <a key={post.id} href={`/article/${post.slug}`} className="group block shrink-0 w-[46vw]">
                    <div className="relative w-full h-28 mb-2 overflow-hidden rounded-lg">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute bottom-0 left-0 bg-brand-green text-white text-[9px] font-bold px-1.5 py-0.5 uppercase">
                        {post.category}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs leading-snug text-gray-900 dark:text-white group-hover:text-brand-green transition-colors line-clamp-2 font-sans">
                      {post.title}
                    </h4>
                  </a>
                ))}
              </div>

              {/* Desktop: horizontal scroll — untouched */}
              <div className="hidden sm:flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
                {relatedArticles.map((post: any) => (
                  <a key={post.id} href={`/article/${post.slug}`} className="group block shrink-0 w-[380px]">
                    <div className="relative w-full h-48 mb-4 overflow-hidden rounded">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute bottom-0 left-0 bg-brand-green text-white text-[10px] font-bold px-2 py-1 uppercase">
                        {post.category}
                      </span>
                    </div>
                    <h4 className="font-bold text-lg leading-tight text-gray-900 dark:text-white group-hover:text-brand-green transition-colors mb-2 font-display">
                      {post.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 line-clamp-2 font-sans">
                      {post.excerpt}
                    </p>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>

      </div>
      <Footer />
    </div>
  );
}