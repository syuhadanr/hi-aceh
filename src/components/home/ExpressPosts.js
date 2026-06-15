'use client';

import Image from 'next/image';
import Link from 'next/link';
import SectionHeader from '../ui/SectionHeader';
import AdSlot from '@/components/ads/AdSlot';
import { useState, useEffect } from 'react';

export default function ExpressPosts({ categories }) {
    const [feedAd, setFeedAd] = useState(null);

    useEffect(() => {
        fetch('/api/ads?location=FEED_INLINE_2')
            .then(r => r.ok ? r.json() : null)
            .then(data => setFeedAd(data))
            .catch(() => {});
    }, []);

    if (!categories || categories.length === 0) return null;

    // Create a combined list of items for desktop rendering
    const gridItems = [];
    if (feedAd) {
        // Show 7 categories and 1 ad card (total 8 slots)
        const cats = categories.slice(0, 7);
        if (cats[0]) gridItems.push({ type: 'category', data: cats[0] });
        if (cats[1]) gridItems.push({ type: 'category', data: cats[1] });
        gridItems.push({ type: 'ad' });
        cats.slice(2).forEach(cat => {
            gridItems.push({ type: 'category', data: cat });
        });
    } else {
        categories.slice(0, 8).forEach(cat => {
            gridItems.push({ type: 'category', data: cat });
        });
    }

    const mobileCategoriesBefore = feedAd ? categories.slice(0, 2) : categories.slice(0, 8);
    const mobileCategoriesAfter = feedAd ? categories.slice(2, 7) : [];

    return (
        <div className="mb-12">
            <SectionHeader title="Kategori Berita" />

            {/* Mobile: compact list per category with ad injected in between */}
            <div className="flex flex-col gap-6 mt-6 md:hidden">
                {mobileCategoriesBefore.map((category) => (
                    <div key={category.slug} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
                        {/* Category header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-primary">
                            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white font-display">
                                {category.title}
                            </h3>
                            <Link href={`/category/${category.slug}`} className="text-[10px] font-bold uppercase text-primary hover:underline">
                                Lihat Semua
                            </Link>
                        </div>

                        {/* 3 articles as compact thumbnail list */}
                        <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
                            {category.articles.slice(0, 3).map((article, idx) => (
                                <Link
                                    key={article.slug}
                                    href={`/article/${article.slug}`}
                                    className="flex gap-3 px-4 py-3 group hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                                >
                                    <div className="relative w-20 h-16 shrink-0 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                        <Image src={article.image} alt={article.title} fill className="object-cover" />
                                        <div className="absolute top-0 left-0 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-br">
                                            {idx + 1}
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-between py-0.5 min-w-0">
                                        <h4 className="font-bold text-sm leading-snug text-zinc-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                                            {article.title}
                                        </h4>
                                        <span className="text-[10px] text-zinc-400">{article.publishedAt}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Mobile Ad card injected in between categories */}
                {feedAd && (
                    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b-2 border-primary">
                            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400 font-display">Sponsor</h3>
                        </div>
                        <div className="overflow-hidden">
                            <AdSlot position="FEED_INLINE_2" />
                        </div>
                    </div>
                )}

                {mobileCategoriesAfter.map((category) => (
                    <div key={category.slug} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-primary">
                            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white font-display">
                                {category.title}
                            </h3>
                            <Link href={`/category/${category.slug}`} className="text-[10px] font-bold uppercase text-primary hover:underline">
                                Lihat Semua
                            </Link>
                        </div>
                        <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
                            {category.articles.slice(0, 3).map((article, idx) => (
                                <Link
                                    key={article.slug}
                                    href={`/article/${article.slug}`}
                                    className="flex gap-3 px-4 py-3 group hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                                >
                                    <div className="relative w-20 h-16 shrink-0 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                        <Image src={article.image} alt={article.title} fill className="object-cover" />
                                        <div className="absolute top-0 left-0 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-br">
                                            {idx + 1}
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-between py-0.5 min-w-0">
                                        <h4 className="font-bold text-sm leading-snug text-zinc-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                                            {article.title}
                                        </h4>
                                        <span className="text-[10px] text-zinc-400">{article.publishedAt}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Tablet/Desktop: card grid — ad card is placed at the 3rd slot */}
            <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">
                {gridItems.map((item, index) => {
                    if (item.type === 'ad') {
                        return (
                            <div key="ad-card" className="flex flex-col bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden min-h-[300px]">
                                <div className="px-4 py-3 border-b-2 border-primary">
                                    <h3 className="text-lg font-black uppercase tracking-wider text-zinc-400 font-display">
                                        Sponsor
                                    </h3>
                                </div>
                                <div className="flex-1 w-full overflow-hidden flex items-stretch">
                                    <AdSlot position="FEED_INLINE_2" className="flex-1" />
                                </div>
                            </div>
                        );
                    }

                    const category = item.data;
                    return (
                        <div key={category.slug} className="flex flex-col bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 border-b-2 border-primary">
                                <h3 className="text-lg font-black uppercase tracking-wider text-zinc-900 dark:text-white font-display">
                                    {category.title}
                                </h3>
                                <Link href={`/category/${category.slug}`} className="text-[10px] font-bold uppercase text-primary hover:underline transition-colors">
                                    Lihat Semua
                                </Link>
                            </div>

                            {category.articles[0] && (
                                <Link href={`/article/${category.articles[0].slug}`} className="group block">
                                    <div className="relative h-40 w-full overflow-hidden">
                                        <Image
                                            src={category.articles[0].image}
                                            alt={category.articles[0].title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition duration-500"
                                        />
                                    </div>
                                    <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                                        <p className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                                            {category.articles[0].title}
                                        </p>
                                        <span className="text-[11px] text-zinc-450 mt-1 block">
                                            {category.articles[0].publishedAt}
                                        </span>
                                    </div>
                                </Link>
                            )}

                            <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800 flex-1">
                                {category.articles.slice(1).map((article) => (
                                    <Link key={article.slug} href={`/article/${article.slug}`} className="group px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                                            {article.title}
                                        </p>
                                        <span className="text-[11px] text-zinc-450 mt-1 block">
                                            {article.publishedAt}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}