"use client";

import React, { useEffect, useState } from "react";

interface Ad {
  id: string;
  type: "IMAGE_BANNER" | "CUSTOM_SCRIPT";
  imageUrl?: string;
  linkUrl?: string;
  scriptCode?: string;
  ratio?: string;
}

export default function AdSlot({ position, className = "" }: { position: string; className?: string }) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const res = await fetch(`/api/ads?location=${position}`);
        if (res.ok) {
          const data = await res.json();
          setAd(data);
        }
      } catch (err) {
        console.error("Failed to load ad slot", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAd();
  }, [position]);

  if (loading || !ad) return null;

  const handleClick = () => {
    fetch(`/api/ads/click?id=${ad.id}`).catch(() => {});
  };

  // Each position has a fixed ratio container; image always covers (crop/zoom)
  let containerClass = "w-full overflow-hidden";
  let imgClass = "w-full h-full object-cover";

  if (position === "HEADER_TOP") {
    // Leaderboard / billboard ratio (~6:1 to 8:1)
    containerClass = "w-full aspect-[6/1] overflow-hidden rounded-sm";
    imgClass = "w-full h-full object-cover";
  } else if (position === "FOOTER_BOTTOM") {
    // Footer banner: leaderboard ratio 728x90 (~8:1)
    containerClass = "w-full aspect-[8/1] overflow-hidden rounded-sm";
    imgClass = "w-full h-full object-cover";
  } else if (position === "SIDEBAR") {
    if (ad.ratio === "9:16") {
      containerClass = "w-full aspect-[9/16] overflow-hidden rounded-xl";
    } else {
      // Default 1:1
      containerClass = "w-full aspect-square overflow-hidden rounded-xl";
    }
    imgClass = "w-full h-full object-cover";
  } else if (position === "FEED_INLINE_1") {
    // Leaderboard banner 8:1
    containerClass = "w-full aspect-[8/1] overflow-hidden rounded-xl";
    imgClass = "w-full h-full object-cover";
} else if (position === "FEED_INLINE_2") {
    // Kategori Berita card header image ratio
    containerClass = "w-full aspect-[4/3] overflow-hidden";
    imgClass = "w-full h-full object-cover";
  } else if (position === "ARTICLE_ABOVE_TITLE" || position === "ARTICLE_BELOW_IMAGE") {
    // Article banner: 16:5 wide banner
    containerClass = "w-full aspect-[16/5] overflow-hidden rounded-lg";
    imgClass = "w-full h-full object-cover";
  } else if (position === "ARTICLE_END") {
    if (ad.ratio === "16:9") {
      containerClass = "w-full aspect-[16/9] overflow-hidden rounded-lg";
    } else if (ad.ratio === "1:1") {
      containerClass = "w-full aspect-square overflow-hidden rounded-lg max-w-sm mx-auto";
    } else {
      containerClass = "w-full aspect-[16/5] overflow-hidden rounded-lg";
    }
    imgClass = "w-full h-full object-cover";
  } else if (position === "ARTICLE_IN_CONTENT") {
    if (ad.ratio === "16:9") {
      containerClass = "w-full aspect-[16/9] overflow-hidden rounded-lg";
    } else if (ad.ratio === "1:1") {
      containerClass = "w-full aspect-square overflow-hidden rounded-lg max-w-sm mx-auto";
    } else {
      containerClass = "w-full aspect-[16/5] overflow-hidden rounded-lg";
    }
    imgClass = "w-full h-full object-cover";
  }

  return (
    <div className={`w-full flex items-center justify-center ${className}`}>
      {ad.type === "IMAGE_BANNER" && ad.imageUrl && (
        <a
          href={ad.linkUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className={`block ${containerClass}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ad.imageUrl}
            alt="Advertisement"
            className={imgClass}
          />
        </a>
      )}

      {ad.type === "CUSTOM_SCRIPT" && ad.scriptCode && (
        <div
          className="w-full overflow-hidden flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: ad.scriptCode }}
        />
      )}
    </div>
  );
}
