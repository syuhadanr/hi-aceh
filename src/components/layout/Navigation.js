'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Navigation({ activeCategory }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef(null);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (searchOpen) searchInputRef.current?.focus();
    }, [searchOpen]);

    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') setSearchOpen(false); };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        const q = searchQuery.trim();
        if (q.length >= 2) {
            router.push(`/search?q=${encodeURIComponent(q)}`);
            setSearchOpen(false);
            setSearchQuery('');
        }
    };

    const mainItems = [
        { label: "HOME", href: "/" },
        { label: "ACEH", href: "/category/aceh" },
        { label: "INDONESIA", href: "/category/indonesia" },
        { label: "POLITIK", href: "/category/politik" },
        { label: "EKONOMI", href: "/category/ekonomi" },
        { label: "BUDAYA", href: "/category/budaya" },
        { label: "WISATA", href: "/category/wisata" },
        { label: "KESEHATAN", href: "/category/kesehatan" },
        { label: "GAYA HIDUP", href: "/category/gaya-hidup" },
    ];

    const moreItems = [
        { label: "GLOBAL", href: "/category/global" },
        { label: "TEKNOLOGI", href: "/category/teknologi" },
        { label: "OLAHRAGA", href: "/category/olahraga" },
        { label: "HIBURAN", href: "/category/hiburan" },
        { label: "DAERAH", href: "/category/daerah" },
        { label: "NASIONAL", href: "/category/nasional" },
    ];

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
        <nav className={`bg-aceh-green text-white sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-lg' : 'shadow-md'}`}>
            <div className="container mx-auto px-4">
                <div className="flex justify-between md:justify-center items-center">
                    <button
                        className="md:hidden p-2 text-white hover:bg-green-800 rounded transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <i className="material-icons">{mobileMenuOpen ? 'close' : 'menu'}</i>
                    </button>

                    <ul className="hidden md:flex items-center font-sans text-xs lg:text-sm font-bold uppercase tracking-wider">
                        {mainItems.map((item) => (
                            <li key={item.label}>
                                <Link href={item.href} className={linkClass(isActive(item.href))}>
                                    {item.label}
                                </Link>
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
                                <i className={`material-icons text-sm transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}>
                                    expand_more
                                </i>
                            </button>

                            {dropdownOpen && (
                                <div className="absolute top-full left-0 bg-aceh-green shadow-lg min-w-[160px] z-50 border-t-2 border-white/20">
                                    {moreItems.map((item) => (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            className={`block px-5 py-3 text-xs font-bold uppercase tracking-wider border-b border-green-800/40 transition-colors ${isActive(item.href) ? 'bg-green-800 text-green-400' : 'text-white hover:bg-green-800 hover:text-green-400'
                                                }`}
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </li>

                        {/* Search button in nav */}
                        <li>
                            <button
                                onClick={() => setSearchOpen(prev => !prev)}
                                className={`block transition-all duration-300 px-3 lg:px-4 ${scrolled ? 'py-2' : 'py-3'} text-white hover:text-green-400`}
                                aria-label="Toggle Search"
                            >
                                <i className="material-icons text-xl">{searchOpen ? 'close' : 'search'}</i>
                            </button>
                        </li>
                    </ul>

                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setSearchOpen(prev => !prev)}
                            className="p-2 text-white"
                        >
                            <i className="material-icons">{searchOpen ? 'close' : 'search'}</i>
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-aceh-green border-t border-green-800 pb-4">
                        <ul className="flex flex-col font-sans text-sm font-bold uppercase tracking-wider">
                            {allItems.map((item) => (
                                <li key={item.label}>
                                    <Link
                                        href={item.href}
                                        className={`block py-3 px-6 border-b border-green-800/50 transition-colors ${isActive(item.href) ? 'bg-green-800 text-green-400' : 'text-white hover:bg-green-800 hover:text-green-400'
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Search bar — drops below nav, overlaps breaking news */}
            <div
                className={`absolute left-0 right-0 top-full z-[60] bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 shadow-xl transition-all duration-300 ease-in-out overflow-hidden ${searchOpen ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                    }`}
            >
                <div className="container mx-auto px-4 py-4">
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
                        <button
                            type="submit"
                            className="bg-brand-green hover:bg-green-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full transition-colors cursor-pointer shrink-0"
                        >
                            Cari
                        </button>
                    </form>
                </div>
            </div>
        </nav>
    );
}