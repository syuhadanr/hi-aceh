'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdSlot from '@/components/ads/AdSlot';

export default function Header() {
    const [darkMode, setDarkMode] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [settings, setSettings] = useState(null);
    const searchInputRef = useRef(null);
    const searchContainerRef = useRef(null);
    const searchBtnRef = useRef(null);
    const router = useRouter();

    const [hasHeaderAd, setHasHeaderAd] = useState(false);

    useEffect(() => {
        const checkAd = async () => {
            try {
                const res = await fetch('/api/ads?location=HEADER_TOP');
                if (res.ok) {
                    const data = await res.json();
                    setHasHeaderAd(!!data);
                }
            } catch (e) {
                console.error(e);
            }
        };
        checkAd();
    }, []);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                if (res.ok) {
                    const data = await res.json();
                    setSettings(data);
                }
            } catch (e) {
                console.error('Failed to load settings in header', e);
            }
        };
        fetchSettings();

        if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setDarkMode(true);
            document.documentElement.classList.add('dark');
        } else {
            setDarkMode(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    useEffect(() => {
        if (searchOpen) searchInputRef.current?.focus();
    }, [searchOpen]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                searchContainerRef.current &&
                !searchContainerRef.current.contains(e.target) &&
                searchBtnRef.current &&
                !searchBtnRef.current.contains(e.target)
            ) {
                setSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') setSearchOpen(false); };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, []);

    const toggleTheme = () => {
        if (darkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setDarkMode(true);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const q = searchQuery.trim();
        if (q.length >= 2) {
            router.push(`/search?q=${encodeURIComponent(q)}`);
            setSearchOpen(false);
            setSearchQuery('');
        }
    };

    return (
        <>
            <header className="bg-[#187957] py-3 border-b border-white/10 transition-colors duration-200 font-sans relative z-[60]">
                {/* Desktop: 3-col grid only when there is a header ad; otherwise simple flex */}
                <div className={`w-full max-w-[1200px] mx-auto px-4 ${
                    hasHeaderAd
                        ? 'hidden md:grid md:grid-cols-[200px_1fr_200px] lg:grid-cols-[250px_1fr_250px] items-center gap-4'
                        : 'hidden md:flex items-center justify-between'
                }`}>
                    {/* Logo (desktop) */}
                    <div className="flex flex-col items-start">
                        <img
                            src={settings?.headerLogo || settings?.siteLogo || "/logo.png"}
                            alt={settings?.siteName || "Hi Aceh"}
                            className={`${hasHeaderAd ? 'h-20 lg:h-24' : 'h-14'} w-auto object-contain transition-all duration-300 max-h-24`} 
                        />
                        {settings?.headerShowSlogan && settings?.siteDescription && !hasHeaderAd && (
                            <span className="text-white/80 text-[10px] font-medium tracking-widest italic mt-1 font-sans">
                                {settings.siteDescription}
                            </span>
                        )}
                    </div>

                    {/* Middle: Ad Slot — hidden on mobile, centered on desktop only when ad exists */}
                    {hasHeaderAd && (
                        <div className="flex items-center justify-center">
                            <AdSlot position="HEADER_TOP" className="w-full max-w-[728px]" />
                        </div>
                    )}

                    {/* Right Controls (desktop) */}
                    <div className="flex items-center gap-4 justify-end">
                        <button
                            ref={searchBtnRef}
                            onClick={() => setSearchOpen(prev => !prev)}
                            className="text-white hover:text-gray-200 transition-colors cursor-pointer flex items-center"
                            aria-label="Toggle Search"
                        >
                            <i className="material-icons text-xl leading-none">
                                {searchOpen ? 'close' : 'search'}
                            </i>
                        </button>

                        <button
                            onClick={toggleTheme}
                            className="text-white hover:text-gray-200 transition-colors cursor-pointer flex items-center"
                            title="Toggle Dark Mode"
                        >
                            <i className="material-icons text-xl leading-none">
                                {darkMode ? 'light_mode' : 'dark_mode'}
                            </i>
                        </button>
                    </div>
                </div>

                {/* Mobile: always show compact header — no ad, normal-sized logo */}
                <div className="w-full max-w-[1200px] mx-auto px-4 flex items-center justify-between md:hidden">
                    {/* Empty left block to keep layout matching HeaderNav or spacing */}
                    <div className="w-10"></div>

                    {/* Logo — always normal size on mobile */}
                    <div className="flex flex-col items-center">
                        <img
                            src={settings?.headerLogo || settings?.siteLogo || "/logo.png"}
                            alt={settings?.siteName || "Hi Aceh"}
                            className="h-10 w-auto object-contain max-h-12"
                        />
                    </div>

                    {/* Mobile Controls */}
                    <div className="flex items-center gap-3">
                        <button
                            ref={searchBtnRef}
                            onClick={() => setSearchOpen(prev => !prev)}
                            className="text-white hover:text-gray-200 transition-colors cursor-pointer flex items-center"
                            aria-label="Toggle Search"
                        >
                            <i className="material-icons text-xl leading-none">
                                {searchOpen ? 'close' : 'search'}
                            </i>
                        </button>

                        <button
                            onClick={toggleTheme}
                            className="text-white hover:text-gray-200 transition-colors cursor-pointer flex items-center"
                            title="Toggle Dark Mode"
                        >
                            <i className="material-icons text-xl leading-none">
                                {darkMode ? 'light_mode' : 'dark_mode'}
                            </i>
                        </button>
                    </div>
                </div>
            </header>

        </>
    );
}