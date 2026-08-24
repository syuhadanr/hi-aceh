"use client";

import React, { useEffect, useState, useRef } from "react";

interface Ad {
  id: string;
  type: "IMAGE_BANNER" | "CUSTOM_SCRIPT";
  imageUrl?: string;
  linkUrl?: string;
  scriptCode?: string;
  ratio?: string;
}

function AdScriptSlot({ ad, className }: { ad: Ad; className: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ad.scriptCode && containerRef.current) {
      containerRef.current.innerHTML = "";
      const range = document.createRange();
      const documentFragment = range.createContextualFragment(ad.scriptCode);
      containerRef.current.appendChild(documentFragment);
    }
  }, [ad]);
  return <div ref={containerRef} className={`flex items-center justify-center overflow-hidden ${className}`} />;
}

const maxHeightMap: Record<string, string> = {
  HEADER_BETWEEN: "max-h-none",
  MAIN_BELOW_HEADLINE: "max-h-none",
  POPULAR_BELOW: "max-h-[192px]",
  FEATURED_AFTER_SELESAI: "max-h-none",
  FEED_AFTER_SELESAI: "max-h-none",
  FEED_ASIDE_TOP: "max-h-none",
  FEED_ASIDE_MID: "max-h-none",
  FEED_ASIDE_BOTTOM: "max-h-none",
  FEED_INLINE_1: "max-h-none",
  FEED_INLINE_2: "max-h-none",
  ARTICLE_ABOVE_TITLE: "max-h-none",
  ARTICLE_BELOW_IMAGE: "max-h-none",
  ARTICLE_IN_CONTENT: "max-h-none",
  ARTICLE_END: "max-h-none",
  SIDEBAR: "max-h-none",
  MOBILE_HEADER: "max-h-none",
  MOBILE_BELOW_HEADLINE: "max-h-none",
  MOBILE_FEED_1: "max-h-none",
  MOBILE_FEED_2: "max-h-none",
  MOBILE_FEED_AFTER: "max-h-none",
  MOBILE_ARTICLE_ABOVE: "max-h-none",
  MOBILE_ARTICLE_MIDDLE: "max-h-none",
  MOBILE_ARTICLE_END: "max-h-none",
};

const skeletonSizeMap: Record<string, string> = {
  HEADER_BETWEEN: "w-full aspect-[6/1]",
  MAIN_BELOW_HEADLINE: "w-full h-48",
  POPULAR_BELOW: "w-full h-48",
  FEATURED_AFTER_SELESAI: "w-full aspect-[6/1]",
  FEED_AFTER_SELESAI: "w-full aspect-[6/1]",
  FEED_ASIDE_TOP: "w-full aspect-[4/5]",
  FEED_ASIDE_MID: "w-full aspect-[4/5]",
  FEED_ASIDE_BOTTOM: "w-full aspect-[4/5]",
  FEED_INLINE_1: "w-full aspect-[6/1]",
  FEED_INLINE_2: "w-full aspect-[4/3]",
  ARTICLE_ABOVE_TITLE: "w-full aspect-[6/1]",
  ARTICLE_BELOW_IMAGE: "w-full aspect-[16/9]",
  ARTICLE_IN_CONTENT: "w-full aspect-[16/9]",
  ARTICLE_END: "w-full aspect-[16/9]",
  SIDEBAR: "w-full aspect-square",
  MOBILE_HEADER: "w-full aspect-[6/1]",
  MOBILE_BELOW_HEADLINE: "w-full aspect-[4/3]",
  MOBILE_FEED_1: "w-full aspect-[4/3]",
  MOBILE_FEED_2: "w-full aspect-[4/3]",
  MOBILE_FEED_AFTER: "w-full aspect-[4/3]",
  MOBILE_ARTICLE_ABOVE: "w-full aspect-[6/1]",
  MOBILE_ARTICLE_MIDDLE: "w-full aspect-[4/3]",
  MOBILE_ARTICLE_END: "w-full aspect-[4/3]",
};

export default function AdSlot({
  position,
  className = "",
  initialAds,
  cardPerAd = false,
}: {
  position?: string;
  className?: string;
  initialAds?: Ad[];
  cardPerAd?: boolean;
}) {
  const pos = position || "DUMMY";
  const [ads, setAds] = useState<Ad[]>(initialAds || []);
  const [loading, setLoading] = useState(initialAds ? false : true);

  useEffect(() => {
    if (initialAds) return;
    async function loadAds() {
      try {
        const res = await fetch(`/api/ads?location=${pos}`);
        if (res.ok) {
          const data = await res.json();
          setAds(Array.isArray(data) ? data : data ? [data] : []);
        }
      } catch (err) {
        console.error("AdSlot fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAds();
  }, [pos, initialAds]);

  const handleAdClick = (id: string) => {
    fetch(`/api/ads/click?id=${id}`).catch(console.error);
  };

  const skeletonClass = skeletonSizeMap[pos] || "w-full aspect-[4/1]";
  const maxHeightClass = maxHeightMap[pos] || "max-h-[300px]";
  const isMobileSlot = pos.startsWith("MOBILE_");
  const responsiveClass = isMobileSlot ? "flex md:hidden" : "hidden md:flex";

  if (loading) return null;

  if (ads.length > 0) {
    return (
      <div className={`${responsiveClass} flex-col gap-4 w-full ${className}`}>
        {ads.map((ad) => {
          if (ad.type === "IMAGE_BANNER" && ad.imageUrl) {
            const imgEl = (
              <div className="flex items-center justify-center rounded-md overflow-hidden bg-zinc-100/50 dark:bg-zinc-900/50 w-full">
                <a
                  href={ad.linkUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleAdClick(ad.id)}
                  className="flex items-center justify-center w-full"
                >
                  <img
                    src={ad.imageUrl}
                    alt="Advertisement"
                    className={`w-full h-auto ${maxHeightClass} object-contain transition-opacity duration-300 hover:opacity-90`}
                  />
                </a>
              </div>
            );

            if (cardPerAd) {
              return (
                <div key={ad.id} className="bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl px-5 py-4 shadow-sm">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400 block mb-2">Sponsor</span>
                  {imgEl}
                </div>
              );
            }

            return <React.Fragment key={ad.id}>{imgEl}</React.Fragment>;
          }

          if (ad.type === "CUSTOM_SCRIPT") {
            return (
              <AdScriptSlot key={ad.id} ad={ad} className={skeletonClass} />
            );
          }

          return null;
        })}
      </div>
    );
  }

  return null;
}

export function SidebarAds() {
  const [adsTop, setAdsTop] = useState<Ad[]>([]);
  const [adsMid, setAdsMid] = useState<Ad[]>([]);
  const [adsBottom, setAdsBottom] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAllAds() {
      try {
        const [resTop, resMid, resBottom] = await Promise.all([
          fetch("/api/ads?location=FEED_ASIDE_TOP"),
          fetch("/api/ads?location=FEED_ASIDE_MID"),
          fetch("/api/ads?location=FEED_ASIDE_BOTTOM"),
        ]);

        let dataTop = [];
        let dataMid = [];
        let dataBottom = [];

        if (resTop.ok) dataTop = await resTop.json();
        if (resMid.ok) dataMid = await resMid.json();
        if (resBottom.ok) dataBottom = await resBottom.json();

        setAdsTop(Array.isArray(dataTop) ? dataTop : dataTop ? [dataTop] : []);
        setAdsMid(Array.isArray(dataMid) ? dataMid : dataMid ? [dataMid] : []);
        setAdsBottom(Array.isArray(dataBottom) ? dataBottom : dataBottom ? [dataBottom] : []);
      } catch (err) {
        console.error("SidebarAds fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAllAds();
  }, []);

  if (loading) {
    return (
      <div className="hidden md:flex flex-col gap-4">
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 p-6">
          <div className="w-full aspect-[4/5] animate-pulse bg-zinc-100 dark:bg-zinc-900 rounded-md" />
        </div>
      </div>
    );
  }

  const hasTop = adsTop.length > 0;
  const hasMid = adsMid.length > 0;
  const hasBottom = adsBottom.length > 0;

  if (!hasTop && !hasMid && !hasBottom) {
    return null;
  }

  return (
    <div className="hidden md:flex flex-col gap-4">
      {hasTop && (
        <AdSlot position="FEED_ASIDE_TOP" initialAds={adsTop} cardPerAd />
      )}
      {hasMid && (
        <AdSlot position="FEED_ASIDE_MID" initialAds={adsMid} cardPerAd />
      )}
      {hasBottom && (
        <AdSlot position="FEED_ASIDE_BOTTOM" initialAds={adsBottom} cardPerAd />
      )}
    </div>
  );
}