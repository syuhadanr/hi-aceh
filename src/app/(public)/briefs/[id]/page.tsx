import React from "react";
import VideoPlayer from "@/components/briefs/VideoPlayer";
import UpNextSidebar from "@/components/briefs/UpNextSidebar";
import TopBar from "@/components/layout/TopBar";
import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";
import HeaderNav from '@/components/layout/HeaderNav';
import Footer from "@/components/layout/Footer";
import { db } from "@/lib/db";
import { mapPrismaArticle } from "@/lib/data";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function BriefPage({ params }: PageProps) {
  const { id } = await params;

  // Find the video article
  const article = await db.article.findFirst({
    where: { id, status: "PUBLISHED", deletedAt: null },
    include: { author: true, category: true, tags: true, featuredImage: true },
  });

  // Fetch recommendations (other published video articles, or just other articles if no video articles exist)
  let recommendations = await db.article.findMany({
    where: {
      type: "VIDEO",
      id: { not: id },
      status: "PUBLISHED",
      deletedAt: null,
    },
    take: 4,
    include: { author: true, category: true, tags: true, featuredImage: true },
  });

  // If there are not enough video recommendations, fallback to standard featured/recent articles
  if (recommendations.length < 4) {
    const extraRecs = await db.article.findMany({
      where: {
        id: { not: id },
        status: "PUBLISHED",
        deletedAt: null,
      },
      take: 4 - recommendations.length,
      include: { author: true, category: true, tags: true, featuredImage: true },
    });
    recommendations = [...recommendations, ...extraRecs];
  }

  const mappedArticle: any = mapPrismaArticle(article as any) || {
    id: id,
    title: "Brief on Flood Preparedness in Aceh: What You Need to Know",
    author: "AcehPost Official",
    publishedAt: "Oct 24, 2024",
    excerpt: "Regional Disaster Management Agency (BPBD) has deployed teams...",
    image: "https://picsum.photos/seed/brief/800/600",
    tags: ["#Aceh", "#Safety", "#News"],
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  };

  // Ensure we have a valid videoUrl fallback
  if (!mappedArticle.videoUrl) {
    mappedArticle.videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4";
  }

  const mappedRecommendations = recommendations.map((r: any) => mapPrismaArticle(r)).filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col font-sans">
      <TopBar />
      <HeaderNav activeCategory={mappedArticle.categorySlug} />

      <main className="flex-grow flex flex-col md:flex-row overflow-hidden relative min-h-[calc(100vh-140px)] z-10">
        {/* Blurred Background */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div
            className="w-full h-full bg-cover bg-center filter blur-3xl scale-110"
            style={{
              backgroundImage: `url(${mappedArticle.image})`,
            }}
          ></div>
        </div>

        <div className="flex-grow flex items-center justify-center p-4 md:p-8 z-10 overflow-y-auto scrollbar-thin">
          <VideoPlayer article={mappedArticle} />
        </div>

        <UpNextSidebar recommendations={mappedRecommendations} />
      </main>

      <Footer />
    </div>
  );
}
