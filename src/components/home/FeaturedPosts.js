'use client';

import Image from 'next/image';
import Link from 'next/link';
import AdSlot from '@/components/ads/AdSlot';
import { useState, useEffect } from 'react';

export default function FeaturedPosts({ articles }) {
    const list = (articles || []).slice(0, 6);
    const [feedAd, setFeedAd] = useState(null);

    useEffect(() => {
        fetch('/api/ads?location=FEED_INLINE_1')
            .then(r => r.ok ? r.json() : null)
            .then(data => setFeedAd(data))
            .catch(() => {});
    }, []);

    if (!list || list.length === 0) return null;

    return (
        <section>
            <div className="flex items-center justify-between mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white uppercase relative font-display">
                    Berita Terbaru
                    <span className="absolute bottom-[-12px] left-0 w-16 h-0.5 bg-primary" />
                </h2>
                <Link href="/latest" className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-primary transition-colors">
                    Selengkapnya
                </Link>
            </div>

            {/* Mobile: list with ad injected after 3rd item */}
            <div className="flex flex-col gap-6 sm:hidden">
                {list.slice(0, 3).map((post, idx) => (
                    <a key={post.id} href={`/article/${post.slug}`} className="flex gap-4 group">
                        <div className="relative w-24 h-20 shrink-0 bg-gray-100 dark:bg-zinc-800 rounded overflow-hidden">
                            <Image src={post.image} alt={post.title} fill className="object-cover" />
                            <div className="absolute top-0 left-0 bg-brand-green text-white text-[10px] font-bold px-1.5 py-0.5">
                                {idx + 1}
                            </div>
                        </div>
                        <div className="flex flex-col justify-between py-0.5">
                            <span className="text-[10px] uppercase font-bold text-brand-green tracking-wider font-sans">
                                {post.category}
                            </span>
                            <h4 className="font-bold text-sm leading-snug text-gray-900 dark:text-white group-hover:text-brand-green transition-colors font-sans line-clamp-2">
                                {post.title}
                            </h4>
                            <span className="text-[10px] text-gray-400 font-sans">{post.publishedAt}</span>
                        </div>
                    </a>
                ))}

                {/* Ad slot injected in between */}
                {feedAd && (
                    <div className="border-t border-zinc-100 dark:border-zinc-850 pt-4">
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400 block mb-2">Sponsor</span>
                        <AdSlot position="FEED_INLINE_1" />
                    </div>
                )}

                {list.slice(3, 5).map((post, idx) => (
                    <a key={post.id} href={`/article/${post.slug}`} className="flex gap-4 group">
                        <div className="relative w-24 h-20 shrink-0 bg-gray-100 dark:bg-zinc-800 rounded overflow-hidden">
                            <Image src={post.image} alt={post.title} fill className="object-cover" />
                            <div className="absolute top-0 left-0 bg-brand-green text-white text-[10px] font-bold px-1.5 py-0.5">
                                {idx + 4}
                            </div>
                        </div>
                        <div className="flex flex-col justify-between py-0.5">
                            <span className="text-[10px] uppercase font-bold text-brand-green tracking-wider font-sans">
                                {post.category}
                            </span>
                            <h4 className="font-bold text-sm leading-snug text-gray-900 dark:text-white group-hover:text-brand-green transition-colors font-sans line-clamp-2">
                                {post.title}
                            </h4>
                            <span className="text-[10px] text-gray-400 font-sans">{post.publishedAt}</span>
                        </div>
                    </a>
                ))}
            </div>

            {/* Tablet/Desktop: card grid — ad replaces 6th slot */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {list.slice(0, feedAd ? 2 : 3).map((item) => (
                    <article key={item.id} className="group flex flex-col gap-3.5 bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900">
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <span className="absolute top-3 left-3 bg-zinc-950/80 text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded backdrop-blur-sm">
                                {item.category}
                            </span>
                        </div>
                        <div className="flex flex-col flex-1 gap-3">
                            <Link href={`/article/${item.slug}`}>
                                <h3 className="font-bold text-sm sm:text-base leading-snug group-hover:text-primary text-zinc-900 dark:text-white line-clamp-2 transition-colors">
                                    {item.title}
                                </h3>
                            </Link>
                            {item.excerpt ? (
                                <p className="text-zinc-500 dark:text-zinc-400 text-xs line-clamp-2">
                                    {item.excerpt}
                                </p>
                            ) : null}
                            <div className="flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400 mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                                <span className="font-semibold text-zinc-700 dark:text-zinc-300">{item.author}</span>
                                <span className="text-zinc-400">•</span>
                                <span>{item.publishedAt}</span>
                            </div>
                        </div>
                    </article>
                ))}

                {/* Ad Card replaces a slot when ad exists */}
                {feedAd && (
                    <article className="group flex flex-col gap-3.5 bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400 px-4 pt-4">Sponsor</span>
                        <div className="flex-1 w-full overflow-hidden">
                            <AdSlot position="FEED_INLINE_1" />
                        </div>
                    </article>
                )}

                {list.slice(feedAd ? 2 : 3, feedAd ? 5 : 6).map((item) => (
                    <article key={item.id} className="group flex flex-col gap-3.5 bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900">
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <span className="absolute top-3 left-3 bg-zinc-950/80 text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded backdrop-blur-sm">
                                {item.category}
                            </span>
                        </div>
                        <div className="flex flex-col flex-1 gap-3">
                            <Link href={`/article/${item.slug}`}>
                                <h3 className="font-bold text-sm sm:text-base leading-snug group-hover:text-primary text-zinc-900 dark:text-white line-clamp-2 transition-colors">
                                    {item.title}
                                </h3>
                            </Link>
                            {item.excerpt ? (
                                <p className="text-zinc-500 dark:text-zinc-400 text-xs line-clamp-2">
                                    {item.excerpt}
                                </p>
                            ) : null}
                            <div className="flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400 mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                                <span className="font-semibold text-zinc-700 dark:text-zinc-300">{item.author}</span>
                                <span className="text-zinc-400">•</span>
                                <span>{item.publishedAt}</span>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}