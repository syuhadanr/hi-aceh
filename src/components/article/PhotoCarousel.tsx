"use client";

import { useState } from "react";
import Image from "next/image";

interface Photo {
    url: string;
    caption: string;
}

export default function PhotoCarousel({ photos }: { photos: Photo[] }) {
    const [current, setCurrent] = useState(0);
    const [aspectRatios, setAspectRatios] = useState<Record<number, number>>({});

    if (!photos || photos.length === 0) return null;

    const prev = () => setCurrent((p) => (p === 0 ? photos.length - 1 : p - 1));
    const next = () => setCurrent((p) => (p === photos.length - 1 ? 0 : p + 1));

    const handleImageLoad = (idx: number, e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        const ratio = img.naturalWidth / img.naturalHeight;
        setAspectRatios((prev) => ({ ...prev, [idx]: ratio }));
    };

    const currentRatio = aspectRatios[current] || 16 / 9;

    return (
        <div className="mb-8">
            {/* Main image — sizes dynamically to the current photo's aspect ratio */}
          <div
    className="relative w-full max-h-[80vh] bg-gray-100 dark:bg-zinc-800 overflow-hidden transition-all duration-300 mx-auto"
    style={{ aspectRatio: currentRatio }}
>
                <Image
                    src={photos[current].url}
                    alt={photos[current].caption || `Foto ${current + 1}`}
                    fill
                    className="object-contain"
                    priority
                    onLoad={(e) => handleImageLoad(current, e)}
                    sizes="(max-width: 768px) 100vw, 800px"
                />
                {/* Nav arrows */}
                {photos.length > 1 && (
                    <>
                        <button
                            onClick={prev}
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                        >
                            <i className="material-icons text-sm">chevron_left</i>
                        </button>
                        <button
                            onClick={next}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                        >
                            <i className="material-icons text-sm">chevron_right</i>
                        </button>
                    </>
                )}
                {/* Counter */}
               {photos.length > 1 && (
    <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded font-sans">
        {current + 1} / {photos.length}
    </div>
)}
                {/* Caption overlay */}
                {photos[current].caption && (
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4">
                        <p className="text-white text-xs font-sans">{photos[current].caption}</p>
                    </div>
                )}
            </div>

            {/* Thumbnail strip */}
            {photos.length > 1 && (
                <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                    {photos.map((photo, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrent(idx)}
                            className={`relative shrink-0 w-16 h-12 overflow-hidden rounded border-2 transition-all ${idx === current
                                    ? "border-brand-green"
                                    : "border-transparent opacity-60 hover:opacity-100"
                                }`}
                        >
                            <Image src={photo.url} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}