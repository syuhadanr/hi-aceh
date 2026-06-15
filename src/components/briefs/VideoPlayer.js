"use client";

import {
    ArrowLeft,
    MoreVertical,
    Heart,
    MessageSquare,
    Bookmark,
    Share2,
    Play,
    Pause,
    Volume2,
    VolumeX
} from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

export default function VideoPlayer({ article }) {
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const videoRef = useRef(null);

    // Dynamic video data from Prisma article prop
    const videoData = {
        title: article?.title || "Video Brief",
        author: article?.author || "AcehPost Team",
        authorAvatar: "/placeholder-avatar.png",
        tags: Array.isArray(article?.tags) ? article.tags : ["#Aceh", "#News"],
        likes: "1.2k",
        comments: "45",
        description: article?.excerpt || "",
        videoSrc: article?.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4"
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            const progress = (video.currentTime / video.duration) * 100;
            setProgress(progress);
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        return () => video.removeEventListener('timeupdate', handleTimeUpdate);
    }, []);

    return (
        <div className="relative w-full max-w-[400px] aspect-[9/16] bg-black rounded-xl shadow-2xl overflow-hidden group border border-white/10">
            {/* Video Element (using placeholder background from reference for now to match look) */}
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuATsgWSJrGDiHnuKVoY50y1g7n26ck5wp959_GIpoHFksYB-1w2IZIcO2Tg06-x_lDgR9ECKIAPfjEW4FmX0b4_mel5v-eaFEmFoFhHc9009FO7V68JUgXTpHb5_vf1dInUWkIM42-FOnhvBAXusu8PPjISxWmar0yxsWkMoHQpLLmSvdYedJ1s8q02f8-ENelIS9D3fQXvw83q13H_SAhOtxcRxz1nQmzixwRSf5akN2NbLwyF3_5SjKJUzF8SumuVTgibjqpNwA")' }}>
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80"></div>
            </div>

            <video
                ref={videoRef}
                src={videoData.videoSrc}
                className="absolute inset-0 w-full h-full object-cover z-0 opacity-0 md:opacity-100" // Hidden on mobile in reference? Keeping visible but checking z-index
                loop
                autoPlay
                playsInline
                onClick={togglePlay}
            />

            {/* Top Controls */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
                <Link href="/" className="bg-black/20 hover:bg-black/40 backdrop-blur-md text-white rounded-full p-2 transition-all">
                    <span className="material-symbols-outlined text-[24px]"><ArrowLeft size={24} /></span>
                </Link>
                <button className="bg-black/20 hover:bg-black/40 backdrop-blur-md text-white rounded-full p-2 transition-all">
                    <span className="material-symbols-outlined text-[24px]"><MoreVertical size={24} /></span>
                </button>
            </div>

            {/* Play Button Overlay */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <button className="flex shrink-0 items-center justify-center rounded-full size-16 bg-black/40 hover:bg-primary/80 text-white backdrop-blur-sm transition-all transform hover:scale-110">
                        <Play size={32} className="fill-current" />
                    </button>
                </div>
            )}

            {/* Right Side Interaction Buttons */}
            <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center z-20">
                <div className="flex flex-col items-center gap-1 group/icon cursor-pointer">
                    <div className="bg-black/20 group-hover/icon:bg-black/40 backdrop-blur-md p-3 rounded-full transition-all">
                        <Heart className="text-white w-7 h-7" />
                    </div>
                    <span className="text-white text-xs font-bold drop-shadow-md">{videoData.likes}</span>
                </div>
                <div className="flex flex-col items-center gap-1 group/icon cursor-pointer">
                    <div className="bg-black/20 group-hover/icon:bg-black/40 backdrop-blur-md p-3 rounded-full transition-all">
                        <MessageSquare className="text-white w-7 h-7" />
                    </div>
                    <span className="text-white text-xs font-bold drop-shadow-md">{videoData.comments}</span>
                </div>
                <div className="flex flex-col items-center gap-1 group/icon cursor-pointer">
                    <div className="bg-black/20 group-hover/icon:bg-black/40 backdrop-blur-md p-3 rounded-full transition-all">
                        <Bookmark className="text-white w-7 h-7" />
                    </div>
                    <span className="text-white text-xs font-bold drop-shadow-md">Save</span>
                </div>
                <div className="flex flex-col items-center gap-1 group/icon cursor-pointer">
                    <div className="bg-black/20 group-hover/icon:bg-black/40 backdrop-blur-md p-3 rounded-full transition-all">
                        <Share2 className="text-white w-7 h-7" />
                    </div>
                    <span className="text-white text-xs font-bold drop-shadow-md">Share</span>
                </div>
            </div>

            {/* Bottom Info Area */}
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex flex-col gap-3">
                <div className="pr-12">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-brand-green flex items-center justify-center text-white text-[10px] font-bold">AP</div>
                        <span className="text-white font-bold text-sm shadow-black drop-shadow-sm">{videoData.author}</span>
                        <button className="bg-white/20 hover:bg-primary text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm transition-colors font-medium">Follow</button>
                    </div>
                    <h1 className="text-white text-lg font-bold leading-tight drop-shadow-md line-clamp-2">{videoData.title}</h1>
                    <p className="text-white/80 text-xs mt-1 font-medium drop-shadow-sm">{videoData.tags.join(' ')}</p>
                </div>

                {/* Progress Bar */}
                <div className="w-full group/progress cursor-pointer py-2">
                    <div className="relative h-1 bg-white/30 rounded-full overflow-hidden w-full">
                        <div
                            className="absolute top-0 left-0 h-full bg-brand-green rounded-full transition-all duration-100 ease-linear"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
