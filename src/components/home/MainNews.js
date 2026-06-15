'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function MainNews({ articles }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const timeoutRef = useRef(null);
    const touchStartX = useRef(null);

    const slides = (articles || []).slice(0, 5);

    const advance = useCallback(() => {
        setActiveIndex((prev) => (prev + 1) % slides.length);
    }, [slides.length]);

    const resetTimer = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (slides.length > 1) timeoutRef.current = setTimeout(advance, 5000);
    }, [advance, slides.length]);

    useEffect(() => {
        resetTimer();
        return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
    }, [activeIndex, resetTimer]);

    const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) setActiveIndex((p) => (p + 1) % slides.length);
            else setActiveIndex((p) => (p - 1 + slides.length) % slides.length);
        }
        touchStartX.current = null;
    };

    if (slides.length === 0) return null;
    const active = slides[activeIndex];

    return (
        <section className="relative font-sans overflow-hidden bg-black -mx-4 sm:-mx-6 lg:mx-0 lg:rounded-lg lg:shadow-md flex flex-col lg:h-[620px]">

            <Link
                href={`/article/${active.slug}`}
                className="relative block w-full aspect-[4/3] sm:aspect-video lg:flex-1 overflow-hidden group"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <Image
                    src={active.image}
                    alt={active.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                    <div className="max-w-full lg:max-w-[70%]">
                        <span className="inline-block bg-primary text-white text-[10px] font-bold px-2.5 py-1 mb-3 uppercase tracking-wider rounded-sm">
                            {active.category}
                        </span>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white leading-tight drop-shadow-md line-clamp-3 lg:line-clamp-4">
                            {active.title}
                        </h2>
                        <p className="text-white/70 text-xs sm:text-sm mt-2 tracking-wide">
                            {active.publishedAt}
                        </p>
                    </div>
                </div>

                {/* Dots — mobile/tablet only, not clickable */}
                {slides.length > 1 && (
                    <div className="lg:hidden absolute bottom-4 right-4 flex gap-1.5 items-center pointer-events-none">
                        {slides.map((_, index) => (
                            <div
                                key={index}
                                className={`rounded-full transition-all duration-300 ${index === activeIndex ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/40'
                                    }`}
                            />
                        ))}
                    </div>
                )}
            </Link>

            {/* Thumbnail strip — desktop only */}
            <div className="hidden lg:grid lg:grid-cols-5 gap-2 bg-gradient-to-b from-black/95 to-black/80 p-3">
                {slides.map((item, index) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveIndex(index)}
                        className="relative flex flex-col text-left transition-all duration-200 group overflow-hidden rounded-xl"
                    >
                        <div className="relative w-full overflow-hidden rounded-t-xl" style={{ height: '80px' }}>
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className={`object-cover transition-all duration-300 ${index === activeIndex ? 'brightness-100' : 'brightness-50 group-hover:brightness-75'
                                    }`}
                                sizes="12vw"
                            />
                        </div>
                        <div className={`flex-grow flex items-start px-2 py-1.5 rounded-b-xl transition-colors ${index === activeIndex ? 'bg-primary' : 'bg-black/40 group-hover:bg-black/60'
                            }`}>
                            <p className={`text-[10px] leading-tight line-clamp-2 font-sans font-medium ${index === activeIndex ? 'text-white font-semibold' : 'text-gray-200 group-hover:text-white'
                                }`}>
                                {item.title}
                            </p>
                        </div>
                    </button>
                ))}
            </div>

        </section>
    );
}