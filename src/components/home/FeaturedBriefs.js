'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

export default function FeaturedBriefs({ articles }) {
    const list = (articles || []).slice(0, 10);
    if (list.length === 0) return null;

    const [current, setCurrent] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const timerRef = useRef(null);
    const touchStartX = useRef(null);

    const visibleCount = isMobile ? 2 : 5;
    const maxIndex = Math.max(0, list.length - visibleCount);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1024);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const next = () => setCurrent((p) => (p >= maxIndex ? 0 : p + 1));
    const prev = () => setCurrent((p) => (p <= 0 ? maxIndex : p - 1));

    const resetTimer = () => {
        clearInterval(timerRef.current);
        timerRef.current = setInterval(next, 3500);
    };

    useEffect(() => {
        timerRef.current = setInterval(next, 3500);
        return () => clearInterval(timerRef.current);
    }, [list.length, isMobile]);

    const handlePrev = () => { prev(); resetTimer(); };
    const handleNext = () => { next(); resetTimer(); };

    const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) { next(); resetTimer(); }
            else { prev(); resetTimer(); }
        }
        touchStartX.current = null;
    };

    return (
        <section className="mb-8 bg-[#0f392b] text-white rounded-xl overflow-hidden px-4 sm:px-6 lg:px-8 pt-5 pb-5 shadow-lg">
            {/* Header — title is a link, no "lihat semua" */}
            <div className="flex justify-between items-center mb-4 border-b border-white/20 pb-3">
                <div className="flex items-center gap-2">
                    <span className="w-1 h-5 bg-white block rounded-full" />
                    <Link href="/category/politik" className="text-base font-bold uppercase font-display tracking-wide hover:text-white/80 transition-colors">
                        Berita Politik
                    </Link>
                </div>
            </div>

            {/* Carousel with side arrows */}
            <div className="relative">
                {/* Left arrow */}
                <button
                    onClick={handlePrev}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition"
                >
                    <i className="material-icons text-sm">chevron_left</i>
                </button>

                {/* Right arrow */}
                <button
                    onClick={handleNext}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition"
                >
                    <i className="material-icons text-sm">chevron_right</i>
                </button>

                <div
                    className="overflow-hidden"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    <div
                        className="flex gap-3 transition-transform duration-500 ease-in-out"
                        style={{
                            transform: `translateX(calc(-${current} * (100% / ${visibleCount}) - ${current} * 0.75rem))`
                        }}
                    >
                        {list.map((item) => (
                            <Link
                                key={item.id}
                                href={`/article/${item.slug}`}
                                style={{ width: `calc((100% - ${(visibleCount - 1)} * 0.75rem) / ${visibleCount})`, flexShrink: 0 }}
                                className="relative group rounded-lg overflow-hidden cursor-pointer shadow-md bg-[#0b2b20] block"
                            >
                                <div className="relative aspect-[4/3] w-full">
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        className="object-cover opacity-80 group-hover:scale-110 transition duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                                    <div className="absolute bottom-0 left-0 w-full p-2 sm:p-3">
                                        <span className="bg-brand-green text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase mb-1 inline-block">
                                            {item.category}
                                        </span>
                                        <h3 className="text-xs font-semibold leading-tight line-clamp-2">{item.title}</h3>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}