'use client';

import { useEffect, useState } from 'react';

export default function TopBar() {
    const [dateStr, setDateStr] = useState('');
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        const now = new Date();
        const formatted = now.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        setDateStr(formatted);

        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings', { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    setSettings(data);
                }
            } catch (e) {
                console.error('Failed to load settings', e);
            }
        };
        fetchSettings();
    }, []);

    return (
        <div className="bg-black text-white text-xs py-2 px-4 shadow-sm font-sans hidden md:block">
            <div className="w-full max-w-[1200px] mx-auto px-4 flex justify-between items-center">
                <div className="flex items-center space-x-6">
                    <span className="font-bold">
                        {/* Desktop: single line */}
                        <span className="hidden md:inline">{dateStr || '\u00a0'}</span>
                        {/* Mobile: two lines */}
                        <span className="md:hidden leading-tight flex flex-col">
                            {dateStr ? (
                                <>
                                    <span>{dateStr.split(',')[0]},</span>
                                    <span>{dateStr.split(',').slice(1).join(',').trim()}</span>
                                </>
                            ) : '\u00a0'}
                        </span>
                    </span>
                    <div className="flex items-center text-gray-300">
                        <i className="material-icons text-yellow-400 text-sm mr-2">wb_sunny</i>
                        <span>Banda Aceh</span>
                    </div>
                </div>
                <div className="flex items-center space-x-6">
                    <div className="flex space-x-3 text-gray-400">
                        <a href={settings?.socialTwitter || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Twitter / X">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.846L2.25 2.25h6.672l4.26 5.631 5.062-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                            </svg>
                        </a>
                        <a href={settings?.socialInstagram || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Instagram">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                        </a>
                        <a href={settings?.socialTikTok || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="TikTok"> <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
</svg>
                        </a>
                        <a href={settings?.socialFacebook || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Facebook">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
