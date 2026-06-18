'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdSlot from '@/components/ads/AdSlot';

export default function HeaderNav({ activeCategory }) {
    const [darkMode, setDarkMode] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [settings, setSettings] = useState(null);
    const [dateStr, setDateStr] = useState('');
    const searchInputRef = useRef(null);
    const pathname = usePathname();
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
                console.error('Failed to load settings in header nav', e);
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
        const now = new Date();
        setDateStr(now.toLocaleDateString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        }));
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Lock body scroll when menu open
    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen]);

    useEffect(() => {
        if (searchOpen) searchInputRef.current?.focus();
    }, [searchOpen]);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') { setSearchOpen(false); setMobileMenuOpen(false); }
        };
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

    const visibleCategories = (settings?.navbarCategories || [])
        .filter(c => c.visible)
        .map(c => ({ label: c.name, href: `/category/${c.slug}` }));

    const mainItems = [{ label: "HOME", href: "/" }, ...visibleCategories.slice(0, 8)];
    const moreItems = visibleCategories.slice(8);
    const allItems = [...mainItems, ...moreItems];

    const isActive = (href) => {
        if (activeCategory) {
            const categorySlug = href.split('/').pop();
            if (categorySlug && activeCategory.toLowerCase() === categorySlug.toLowerCase()) return true;
        }
        if (!pathname) return false;
        const normPath = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
        const normHref = href.endsWith('/') && href.length > 1 ? href.slice(0, -1) : href;
        if (normHref === '/') return normPath === '/';
        return normPath === normHref || normPath.startsWith(normHref + '/');
    };

    const isMoreActive = moreItems.some((item) => isActive(item.href));

    const linkClass = (active) =>
        `block transition-all duration-300 px-3 lg:px-4 ${scrolled ? 'py-2' : 'py-3'} ${active ? 'text-green-400 font-black' : 'text-white border-transparent hover:text-green-400'
        }`;

    return (
        <>
            {/* ── FULLSCREEN MOBILE MENU OVERLAY ── */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[100] bg-[#0f392b] flex flex-col md:hidden">
                    {/* Top bar inside overlay */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                        <img
                            src={settings?.headerLogo || settings?.siteLogo || "/logo.png"}
                            alt={settings?.siteName || "Hi Aceh"}
                            className="h-12 w-auto"
                        />
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="w-10 h-10 rounded-lg border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition"
                        >
                            <i className="material-icons">close</i>
                        </button>
                    </div>

                    {/* 2-column grid of nav items */}
                    <div className="flex-1 overflow-y-auto px-6 py-8">
                        <div className="grid grid-cols-2 gap-x-8">
                            {allItems.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`py-4 border-b font-bold text-sm tracking-wide transition-colors ${isActive(item.href)
                                        ? 'text-white/40 border-white/10'
                                        : 'text-white border-white/10 hover:text-green-400'
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── HEADER ── */}
            <header className="bg-[#187957] py-3 border-b border-white/10 transition-colors duration-200 font-sans">

                {/* ── DESKTOP HEADER ── */}
                {hasHeaderAd ? (
                    /* With ad: 3-column grid so ad sits centred between logo and controls */
                    <div className="w-full max-w-[1200px] mx-auto px-4 hidden md:grid md:grid-cols-[200px_1fr_200px] lg:grid-cols-[250px_1fr_250px] items-center gap-4">
                        {/* Logo */}
                        <div className="flex flex-col items-start">
                            <img
                                src={settings?.headerLogo || settings?.siteLogo || "/logo.png"}
                                alt={settings?.siteName || "Hi Aceh"}
                                className="h-16 lg:h-20 w-auto object-contain max-h-20 transition-all duration-300"
                            />
                        </div>

                        {/* Ad slot */}
                        <div className="flex items-center justify-center">
                            <div className="w-full max-w-[728px] aspect-[8/1] overflow-hidden">
                                <AdSlot position="HEADER_TOP" className="w-full h-full" />
                            </div>
                        </div>

                        {/* Right controls */}
                        <div className="flex items-center gap-4 justify-end">
                            <button onClick={() => setSearchOpen(prev => !prev)} className="text-white hover:text-gray-200 transition-colors cursor-pointer flex items-center" aria-label="Toggle Search">
                                <i className="material-icons text-xl leading-none">{searchOpen ? 'close' : 'search'}</i>
                            </button>
                            <button onClick={toggleTheme} className="text-white hover:text-gray-200 transition-colors cursor-pointer flex items-center">
                                <i className="material-icons text-xl leading-none">{darkMode ? 'light_mode' : 'dark_mode'}</i>
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Without ad: logo perfectly centred, controls pinned to the right */
                    <div className="w-full max-w-[1200px] mx-auto px-4 hidden md:flex items-center justify-center relative">
                        {/* Logo — centred */}
                        <div className="flex flex-col items-center">
                            <img
                                src={settings?.headerLogo || settings?.siteLogo || "/logo.png"}
                                alt={settings?.siteName || "Hi Aceh"}
                                className="h-16 w-auto object-contain max-h-20 transition-all duration-300"
                            />
                          {settings?.headerShowSlogan && settings?.siteDescription && (
    <span className="text-white/80 text-[10px] font-medium tracking-widest italic mt-1 font-sans">
        {settings.siteDescription}
    </span>
)}
                        </div>

                        {/* Controls — absolute right so logo stays centred */}
                        <div className="absolute right-4 flex items-center gap-4">
                            <button onClick={() => setSearchOpen(prev => !prev)} className="text-white hover:text-gray-200 transition-colors cursor-pointer flex items-center" aria-label="Toggle Search">
                                <i className="material-icons text-xl leading-none">{searchOpen ? 'close' : 'search'}</i>
                            </button>
                            <button onClick={toggleTheme} className="text-white hover:text-gray-200 transition-colors cursor-pointer flex items-center">
                                <i className="material-icons text-xl leading-none">{darkMode ? 'light_mode' : 'dark_mode'}</i>
                            </button>
                        </div>
                    </div>
                )}

                {/* ── MOBILE HEADER — always compact, no ad ── */}
                <div className="w-full max-w-[1200px] mx-auto px-4 flex items-center justify-between md:hidden">
                    {/* Mobile Date */}
                    <div className="flex flex-col justify-center leading-tight shrink-0">
                        <span className="text-white text-[10px] font-bold opacity-80">
                            {dateStr.split(',')[0]},
                        </span>
                        <span className="text-white text-[10px] font-bold opacity-80">
                            {dateStr.split(',').slice(1).join(',').trim()}
                        </span>
                    </div>

                    {/* Logo */}
                    <div className="flex flex-col items-center">
                        <img
                            src={settings?.headerLogo || settings?.siteLogo || "/logo.png"}
                            alt={settings?.siteName || "Hi Aceh"}
                            className="h-10 w-auto object-contain max-h-12"
                        />
                    </div>

                    {/* Mobile Controls */}
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSearchOpen(prev => !prev)} className="text-white hover:text-gray-200 transition-colors cursor-pointer flex items-center" aria-label="Toggle Search">
                            <i className="material-icons text-xl leading-none">{searchOpen ? 'close' : 'search'}</i>
                        </button>
                        <button onClick={toggleTheme} className="text-white hover:text-gray-200 transition-colors cursor-pointer flex items-center">
                            <i className="material-icons text-xl leading-none">{darkMode ? 'light_mode' : 'dark_mode'}</i>
                        </button>
                    </div>
                </div>
            </header>

            {/* ── NAVIGATION ── */}
            <nav className={`bg-aceh-green text-white sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-lg' : 'shadow-md'}`}>
                <div className="w-full max-w-[1200px] mx-auto px-4">
                    <div className="flex justify-between md:justify-center items-center">

                        {/* Mobile Nav */}
                        <div className="md:hidden flex items-center justify-between w-full">
                            {!scrolled ? (
                                <ul className="flex items-center gap-4 overflow-x-auto hide-scrollbar whitespace-nowrap text-[11px] font-bold uppercase py-3 w-full">
                                    {mainItems.map((item) => (
                                        <li key={item.label} className="shrink-0">
                                            <Link href={item.href} className={isActive(item.href) ? 'text-green-400' : 'text-white/90'}>
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <>
                                    <button
                                        className="p-2 text-white hover:bg-green-800 rounded transition-colors"
                                        onClick={() => setMobileMenuOpen(true)}
                                    >
                                        <i className="material-icons">menu</i>
                                    </button>
                                    <span className="text-white font-bold text-sm sm:text-base tracking-wide flex-1 text-center truncate px-2">
                                        {settings?.siteName || "HIACEH.ID"}
                                    </span>
                                    <button onClick={() => setSearchOpen(prev => !prev)} className="p-2 text-white hover:bg-green-800 rounded transition-colors">
                                        <i className="material-icons">{searchOpen ? 'close' : 'search'}</i>
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Desktop Nav */}
                        <ul className="hidden md:flex items-center font-sans text-xs lg:text-sm font-bold uppercase tracking-wider">
                            {mainItems.map((item) => (
                                <li key={item.label}>
                                    <Link href={item.href} className={linkClass(isActive(item.href))}>{item.label}</Link>
                                </li>
                            ))}
                            <li className="relative">
                                <button
                                    onClick={() => setDropdownOpen((p) => !p)}
                                    onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                                    className={`flex items-center gap-1 transition-all duration-300 px-3 lg:px-4 border-b-2 ${scrolled ? 'py-2' : 'py-3.5'} ${isMoreActive ? 'text-green-400 font-black border-green-400' : 'text-white border-transparent hover:text-green-400'
                                        }`}
                                >
                                    LAINNYA
                                    <i className={`material-icons text-sm transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}>expand_more</i>
                                </button>
                                {dropdownOpen && (
                                    <div className="absolute top-full left-0 bg-aceh-green shadow-lg min-w-[160px] z-50 border-t-2 border-white/20">
                                        {moreItems.map((item) => (
                                            <Link key={item.label} href={item.href} className={`block px-5 py-3 text-xs font-bold uppercase tracking-wider border-b border-green-800/40 transition-colors ${isActive(item.href) ? 'bg-green-800 text-green-400' : 'text-white hover:bg-green-800 hover:text-green-400'
                                                }`}>
                                                {item.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </li>
                            {scrolled && (
                                <li>
                                    <button
                                        onClick={() => setSearchOpen(prev => !prev)}
                                        className={`flex items-center transition-all duration-300 px-3 lg:px-4 py-2 text-white hover:text-green-400`}
                                        aria-label="Toggle Search"
                                    >
                                        <i className="material-icons text-lg leading-none">
                                            {searchOpen ? 'close' : 'search'}
                                        </i>
                                    </button>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Search bar */}
                <div className={`absolute left-0 right-0 top-full z-[60] bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 shadow-xl transition-all duration-300 ease-in-out overflow-hidden ${searchOpen ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                    }`}>
                    <div className="w-full max-w-[1200px] mx-auto px-4 py-4">
                        <form onSubmit={handleSearch} className="flex items-center gap-3 max-w-2xl mx-auto">
                            <div className="flex-1 relative">
                                <i className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">search</i>
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Cari berita..."
                                    className="w-full pl-10 pr-4 py-3 text-sm rounded-full border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-colors font-sans"
                                />
                            </div>
                            <button type="submit" className="bg-brand-green hover:bg-green-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full transition-colors cursor-pointer shrink-0">
                                Cari
                            </button>
                        </form>
                    </div>
                </div>
            </nav>
        </>
    );
}