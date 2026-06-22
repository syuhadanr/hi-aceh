'use client';

import Link from 'next/link';

export default function BreakingNewsTicker({ items }) {
    // Duplicate items for seamless loop
    const doubled = [...items, ...items];

    return (
        <div className="bg-white border-b border-gray-200 dark:bg-zinc-900 dark:border-zinc-800">
            <div className="w-full max-w-[1200px] mx-auto px-4 flex items-center">
                <div className="hidden md:flex bg-brand-green text-white text-xs font-bold px-4 py-3 uppercase shrink-0 items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    Breaking News
                </div>
                <div className="flex-1 overflow-hidden relative h-10 flex items-center bg-gray-50 dark:bg-zinc-800 group">
                    <div className="absolute whitespace-nowrap animate-marquee flex items-center group-hover:[animation-play-state:paused] ps-4">
                        {doubled.map((item, i) => (
                            <span key={`${item.id}-${i}`} className="inline-flex items-center mr-12 text-sm font-medium text-gray-800 dark:text-gray-200">
                                {/* Blinking dot instead of hardcoded time */}
                                <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse mr-3 shrink-0" aria-hidden="true" />
                                {item.slug ? (
                                    <Link href={`/article/${item.slug}`} className="hover:text-brand-green transition-colors">
                                        {item.title}
                                    </Link>
                                ) : (
                                    item.title
                                )}
                            </span>
                        ))}
                    </div>
                    {/* Fade edges */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-50 dark:from-zinc-800 to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 dark:from-zinc-800 to-transparent z-10 pointer-events-none"></div>
                </div>
                <div className="hidden md:flex items-center border-l border-gray-200 dark:border-zinc-700 h-10 px-2 bg-white dark:bg-zinc-900">
                    <button className="p-1 text-gray-400 hover:text-brand-green transition-colors">
                        <i className="material-icons text-sm">chevron_left</i>
                    </button>
                    <button className="p-1 text-gray-400 hover:text-brand-green transition-colors">
                        <i className="material-icons text-sm">chevron_right</i>
                    </button>
                </div>
            </div>
        </div>
    );
}
