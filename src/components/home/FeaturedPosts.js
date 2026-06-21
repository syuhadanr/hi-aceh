'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AdSlot from '@/components/ads/AdSlot';

export default function FeaturedPosts({ articles }) {
    const list = (articles || []).slice(0, 20);
    const mobileList = (articles || []).slice(0, 20);

    if (!list || list.length === 0) return null;

    return (
        <section>
            <div className="flex items-center justify-between mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white uppercase relative font-display">
                    Berita Terbaru
                    <span className="absolute bottom-[-12px] left-0 w-16 h-0.5 bg-primary" />
                </h2>
            </div>

            {/* Mobile: compact list */}
            <div className="flex flex-col gap-6 sm:hidden">
                {mobileList.slice(0, 3).map((post, idx) => (
                    <a key={post.id} href={`/article/${post.slug}`} className="flex gap-4 group">
                        <div className="relative w-24 h-20 shrink-0 bg-gray-100 dark:bg-zinc-800 rounded overflow-hidden">
                            <Image src={post.image} alt={post.title} fill className="object-cover" />
                        </div>
                        <div className="flex flex-col justify-between py-0.5">
                            <span className="text-[10px] uppercase font-bold text-brand-green tracking-wider font-sans">{post.category}</span>
                            <h4 className="font-bold text-sm leading-snug text-gray-900 dark:text-white group-hover:text-brand-green transition-colors font-sans">{post.title}</h4>
                            <span className="text-[10px] text-gray-400 font-sans">{post.publishedAt}</span>
                        </div>
                    </a>
                ))}

                <div className="bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl px-5 py-4 shadow-sm">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400 block mb-2">Sponsor</span>
                    <AdSlot position="MOBILE_FEED_1" />
                </div>

                {mobileList.slice(3).map((post, idx) => (
                    <React.Fragment key={post.id}>
                        <a href={`/article/${post.slug}`} className="flex gap-4 group">
                            <div className="relative w-24 h-20 shrink-0 bg-gray-100 dark:bg-zinc-800 rounded overflow-hidden">
                                <Image src={post.image} alt={post.title} fill className="object-cover" />
                            </div>
                            <div className="flex flex-col justify-between py-0.5">
                                <span className="text-[10px] uppercase font-bold text-brand-green tracking-wider font-sans">{post.category}</span>
                                <h4 className="font-bold text-sm leading-snug text-gray-900 dark:text-white group-hover:text-brand-green transition-colors font-sans">{post.title}</h4>
                                <span className="text-[10px] text-gray-400 font-sans">{post.publishedAt}</span>
                            </div>
                        </a>
                        {idx === 2 && mobileList.length > 6 && (
                            <div className="bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl px-5 py-4 shadow-sm">
                                <span className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400 block mb-2">Sponsor</span>
                                <AdSlot position="MOBILE_FEED_2" />
                            </div>
                        )}
                    </React.Fragment>
                ))}

                <div className="flex justify-center pt-2">
                    <Link href="/latest" className="px-6 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-full text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 hover:border-primary hover:text-primary transition-colors">
                        Selengkapnya
                    </Link>
                </div>
            </div>

            {/* Desktop: search-style cards */}
            <div className="hidden sm:flex flex-col gap-4">
                {[
                    ...[list[0]].filter(Boolean),
                    ...(list.length > 1 ? [{ __slot: 'FEED_INLINE_1' }] : []),
                    ...[list[1]].filter(Boolean),
                    ...(list.length > 2 ? [{ __slot: 'FEED_INLINE_2' }] : []),
                    ...list.slice(2),
                ].map((post, idx) => {
                    if (post && post.__slot) {
                        return (
                            <AdSlot key={`ad-slot-${idx}`} position={post.__slot} cardPerAd />
                        );
                    }
                    return (
                        <div key={post.id} className="flex gap-5 bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group">
                            <div className="relative w-44 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900 aspect-[4/3]">
                                <Image src={post.image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                <span className="absolute top-3 left-3 bg-zinc-950/80 text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded backdrop-blur-sm">
                                    {post.category}
                                </span>
                            </div>
                            <div className="flex flex-col flex-1 justify-between py-1 gap-2">
                                <div className="flex flex-col gap-1.5">
                                    <Link href={`/article/${post.slug}`}>
                                        <h3 className="font-bold text-lg leading-snug group-hover:text-primary text-zinc-900 dark:text-white transition-colors">
                                            {post.title}
                                        </h3>
                                    </Link>
                                    {post.excerpt && (
                                        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">{post.excerpt}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-500 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                                    <span>{post.publishedAt}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}

                <div className="flex justify-center pt-2">
                    <Link href="/latest" className="px-8 py-3 border border-zinc-300 dark:border-zinc-700 rounded-full text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 hover:border-primary hover:text-primary transition-colors">
                        Selengkapnya
                    </Link>
                </div>
            </div>
        </section>
    );
}