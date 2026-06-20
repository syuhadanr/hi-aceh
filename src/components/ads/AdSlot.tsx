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

export default function AdSlot({ position, className = "" }: { position?: string; className?: string }) {
  const pos = position || "DUMMY";
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const scriptContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadAd() {
      try {
        const res = await fetch(`/api/ads?location=${pos}`);
        if (res.ok) {
          const data = await res.json();
          setAd(data);
        }
      } catch (err) {
        console.error("AdSlot fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAd();
  }, [pos]);

  // Inject script for CUSTOM_SCRIPT ads
  useEffect(() => {
    if (ad?.type === "CUSTOM_SCRIPT" && ad.scriptCode && scriptContainerRef.current) {
      scriptContainerRef.current.innerHTML = "";
      const range = document.createRange();
      const documentFragment = range.createContextualFragment(ad.scriptCode);
      scriptContainerRef.current.appendChild(documentFragment);
    }
  }, [ad]);

  const handleAdClick = () => {
    if (ad?.id) {
      fetch(`/api/ads/click?id=${ad.id}`).catch(console.error);
    }
  };

  // Map position to aspect ratio / sizing for fallback visual dummy ads
  const sizeMap: Record<string, string> = {
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
    ARTICLE_IN_CONTENT: "w-full aspect-[16/9]",
    ARTICLE_END: "w-full aspect-[16/9]",
    SIDEBAR: "w-full aspect-square",
  };

  const sizeClass = sizeMap[pos] || "w-full aspect-[4/1]";

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${sizeClass} animate-pulse bg-zinc-100 dark:bg-zinc-900 rounded-md ${className}`} />
    );
  }

  // If there's a configured active ad, show it
  if (ad) {
    if (ad.type === "IMAGE_BANNER" && ad.imageUrl) {
      return (
        <div className={`flex items-center justify-center ${sizeClass} rounded-md overflow-hidden bg-zinc-100/50 dark:bg-zinc-900/50 ${className}`}>
          <a
            href={ad.linkUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleAdClick}
            className="flex items-center justify-center w-full h-full"
          >
            <img
              src={ad.imageUrl}
              alt="Advertisement"
              className="max-w-full max-h-full object-contain transition-opacity duration-300 hover:opacity-90"
            />
          </a>
        </div>
      );
    }

    if (ad.type === "CUSTOM_SCRIPT") {
      return (
        <div 
          ref={scriptContainerRef} 
          className={`flex items-center justify-center overflow-hidden ${className}`} 
        />
      );
    }
  }

  // Fallback to dummy banner if no ad is configured
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClass} rounded-md overflow-hidden flex items-center justify-center bg-gradient-to-r from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700 border border-zinc-300 dark:border-zinc-700 w-full`}>
        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">Dummy Ad — {pos}</span>
      </div>
    </div>
  );
}
