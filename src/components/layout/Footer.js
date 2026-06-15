"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import AdSlot from '@/components/ads/AdSlot';

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const [settings, setSettings] = useState(null);
    const [pages, setPages] = useState(null);
    const [footerAd, setFooterAd] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                if (res.ok) {
                    const data = await res.json();
                    setSettings(data);
                }
            } catch (e) {
                console.error('Failed to load settings', e);
            }
        };

        const fetchPages = async () => {
            try {
                const res = await fetch('/api/pages');
                if (res.ok) {
                    const data = await res.json();
                    setPages(data);
                }
            } catch (e) {
                console.error('Failed to load pages', e);
            }
        };

        const fetchFooterAd = async () => {
            try {
                const res = await fetch('/api/ads?location=FOOTER_BOTTOM');
                if (res.ok) {
                    const data = await res.json();
                    setFooterAd(data);
                }
            } catch (e) {
                console.error('Failed to load footer ad', e);
            }
        };

        fetchSettings();
        fetchPages();
        fetchFooterAd();
    }, []);

    const activePageSlugs = settings?.footerShowPages || ["about", "redaksi", "disclaimer", "pedoman-media", "privacy-policy", "terms-of-service"];

    const allCompanyLinks = [
        { key: 'about', label: pages?.about?.title || 'Tentang Kami', href: '/about' },
        { key: 'redaksi', label: pages?.redaksi?.title || 'Susunan Redaksi', href: '/redaksi' },
        { key: 'disclaimer', label: pages?.disclaimer?.title || 'Disclaimer', href: '/disclaimer' },
        { key: 'pedoman-media', label: pages?.['pedoman-media']?.title || 'Pedoman Pemberitaan Media Siber', href: '/pedoman-media' },
    ];

    const companyLinks = allCompanyLinks.filter(link => activePageSlugs.includes(link.key));
    const showPrivacy = activePageSlugs.includes("privacy-policy");
    const showTerms = activePageSlugs.includes("terms-of-service");

    const footerLogoUrl = settings?.footerLogo || settings?.siteLogo || "/logo.png";
    const isFooterCustomLogo = !!(settings?.footerLogo || settings?.siteLogo);
    const footerDesc = settings?.footerDescription || "Portal Berita Aceh & Indonesia Terkini";

    const footerCategories = settings?.footerShowCategories || [
        { name: 'Utama (Home)', slug: '' },
        { name: 'Aceh', slug: 'aceh' },
        { name: 'Budaya', slug: 'budaya' },
        { name: 'Ekonomi', slug: 'ekonomi' },
        { name: 'Indonesia', slug: 'indonesia' },
        { name: 'Politik', slug: 'politik' },
        { name: 'Wisata', slug: 'wisata' },
    ];

    return (
        <footer className="bg-zinc-950 text-white border-t-4 border-brand-green font-sans">

            {/* ── MOBILE LAYOUT (hidden on md+) ── */}
            <div className="md:hidden px-5 pt-6 pb-0 flex flex-col items-center">

                {/* Social icons row */}
                <div className="flex gap-2 mb-5">
                    <a href={settings?.socialFacebook || "#"} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                        className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-[#1877F2] transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                    </a>
                    <a href={settings?.socialInstagram || "#"} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                        className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-pink-600 transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                    </a>
                    <a href={settings?.socialTwitter || "#"} target="_blank" rel="noopener noreferrer" aria-label="X / Twitter"
                        className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-black border border-transparent hover:border-white/20 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.846L2.25 2.25h6.672l4.26 5.631 5.062-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                        </svg>
                    </a>
                    <a href={settings?.socialYoutube || "#"} target="_blank" rel="noopener noreferrer" aria-label="YouTube"
                        className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-[#FF0000] transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                    </a>
                </div>

                {/* Perusahaan links — compact inline wrap */}
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mb-5">
                    {companyLinks.map((link) => (
                        <Link key={link.key} href={link.href}
                            className="text-[11px] text-zinc-400 hover:text-brand-green transition-colors">
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Footer ad on mobile */}
                {footerAd && (
                    <div className="w-full max-w-[320px] aspect-[16/9] bg-zinc-900 rounded-lg overflow-hidden flex items-center justify-center p-1 mb-5 mx-auto">
                        <a href={footerAd.linkUrl || "#"} target="_blank" rel="noopener noreferrer" onClick={() => fetch(`/api/ads/click?id=${footerAd.id}`).catch(() => {})} className="block w-full h-full">
                            <img src={footerAd.imageUrl} alt="Sponsor" className="w-full h-full object-contain" />
                        </a>
                    </div>
                )}

                {/* Mobile bottom bar */}
                <div className="border-t border-zinc-800 py-4 flex flex-col items-center gap-1.5 text-[10px] text-zinc-500 text-center">
                    <span>© {currentYear} {settings?.siteName || 'Hi Aceh'}. Hak Cipta Dilindungi.</span>
                    <div className="flex gap-4">
                        {showPrivacy && (
                            <Link href="/privacy-policy" className="hover:text-white transition-colors uppercase tracking-widest">
                                {pages?.['privacy-policy']?.title || 'Kebijakan Privasi'}
                            </Link>
                        )}
                        {showPrivacy && showTerms && <span className="text-zinc-700">•</span>}
                        {showTerms && (
                            <Link href="/terms-of-service" className="hover:text-white transition-colors uppercase tracking-widest">
                                {pages?.['terms-of-service']?.title || 'Ketentuan Layanan'}
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* ── DESKTOP LAYOUT (hidden on mobile) ── */}
            <div className="hidden md:block">
                <div className="container mx-auto px-4 pt-14">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12">

                        {/* Column 1: Brand & Info */}
                        <div className="md:col-span-2 lg:col-span-1">
                            <div className="mb-4">
                                <img src={footerLogoUrl} alt={settings?.siteName || "Hi Aceh"}
                                    className={`h-16 w-auto ${!isFooterCustomLogo ? 'brightness-0 invert' : ''}`} />
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed mb-5 font-sans">{footerDesc}</p>
                            <div className="space-y-2 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <i className="material-icons text-base text-brand-green">email</i>
                                    <a href={settings?.contactEmail ? `mailto:${settings.contactEmail}` : '#'} className="hover:text-white transition-colors">
                                        {settings?.contactEmail || 'redaksi@hiaceh.com'}
                                    </a>
                                </div>
                                <div className="flex items-center gap-2">
                                    <i className="material-icons text-base text-brand-green">location_on</i>
                                    <span>{settings?.address || 'Banda Aceh, Aceh, Indonesia'}</span>
                                </div>
                                {settings?.phoneNumber && (
                                    <div className="flex items-center gap-2">
                                        <i className="material-icons text-base text-brand-green">phone</i>
                                        <a href={`tel:${settings.phoneNumber}`} className="hover:text-white transition-colors">{settings.phoneNumber}</a>
                                    </div>
                                )}
                                {settings?.faxNumber && (
                                    <div className="flex items-center gap-2">
                                        <i className="material-icons text-base text-brand-green">print</i>
                                        <span>Fax: {settings.faxNumber}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Column 2: Kategori Berita OR Ad Slot */}
                        <div>
                            {footerAd ? (
                                <div className="w-full h-full flex flex-col">
                                    <h3 className="text-xm font-bold uppercase tracking-widest mb-4 text-white border-b border-brand-green pb-2 inline-block font-sans">
                                        Sponsor
                                    </h3>
                                    <div className="relative flex-1 min-h-[120px] bg-zinc-900 rounded-lg overflow-hidden flex items-center justify-center p-1">
                                        <a href={footerAd.linkUrl || "#"} target="_blank" rel="noopener noreferrer" onClick={() => fetch(`/api/ads/click?id=${footerAd.id}`).catch(() => {})} className="block w-full h-full">
                                            <img src={footerAd.imageUrl} alt="Sponsor" className="w-full h-full object-contain" />
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-xm font-bold uppercase tracking-widest mb-4 text-white border-b border-brand-green pb-2 inline-block font-sans">
                                        Kategori Berita
                                    </h3>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                        {footerCategories.map((cat) => (
                                            <Link key={cat.slug} href={cat.slug ? `/category/${cat.slug}` : '/'}
                                                className="text-sm text-gray-400 hover:text-brand-green transition-colors">
                                                {cat.name}
                                            </Link>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Column 3: Perusahaan */}
                        <div>
                            <h3 className="text-xm font-bold uppercase tracking-widest mb-4 text-white border-b border-brand-green pb-2 inline-block">
                                Perusahaan
                            </h3>
                            <ul className="space-y-2">
                                {companyLinks.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-sm text-gray-400 hover:text-brand-green transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 4: Social */}
                        <div>
                            <h3 className="text-xm font-bold uppercase tracking-widest mb-4 text-white border-b border-brand-green pb-2 inline-block">
                                {settings?.footerSocialTitle || "IKUTI MEDIA SOSIAL"}
                            </h3>
                            <p className="text-sm text-gray-400 leading-relaxed mb-5">
                                {settings?.footerSocialDescription || "Tetap terhubung dengan kabar terkini dari Aceh dan Indonesia melalui saluran media sosial kami."}
                            </p>
                            <div className="flex gap-3">
                                <a href={settings?.socialFacebook || "#"} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                                    className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-[#1877F2] transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </a>
                                <a href={settings?.socialInstagram || "#"} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                                    className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-gradient-to-br hover:from-purple-600 hover:via-pink-500 hover:to-orange-400 transition-all">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                </a>
                                <a href={settings?.socialTwitter || "#"} target="_blank" rel="noopener noreferrer" aria-label="X / Twitter"
                                    className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-black transition-colors border border-transparent hover:border-white/20">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.846L2.25 2.25h6.672l4.26 5.631 5.062-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                                    </svg>
                                </a>
                                <a href={settings?.socialYoutube || "#"} target="_blank" rel="noopener noreferrer" aria-label="YouTube"
                                    className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-[#FF0000] transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Bottom Bar */}
                    <div className="border-t border-zinc-800 py-5 flex flex-col md:flex-row justify-between items-center text-[11px] text-zinc-500 font-sans gap-3">
                        <div className="flex items-center gap-2">
                            <img src={footerLogoUrl} alt={settings?.siteName || "Hi Aceh"}
                                className={`h-5 w-auto ${!isFooterCustomLogo ? 'brightness-0 invert' : ''} opacity-60`} />
                            <span>© {currentYear} {settings?.siteName || 'Hi Aceh'}. Hak Cipta Dilindungi.</span>
                        </div>
                        <div className="flex gap-5">
                            {showPrivacy && (
                                <Link href="/privacy-policy" className="hover:text-white transition-colors uppercase tracking-widest">
                                    {pages?.['privacy-policy']?.title || 'Kebijakan Privasi'}
                                </Link>
                            )}
                            {showPrivacy && showTerms && <span className="text-zinc-700">•</span>}
                            {showTerms && (
                                <Link href="/terms-of-service" className="hover:text-white transition-colors uppercase tracking-widest">
                                    {pages?.['terms-of-service']?.title || 'Ketentuan Layanan'}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </footer>
    );
}