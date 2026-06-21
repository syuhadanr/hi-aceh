'use client';

import { useEffect, useRef } from 'react';

export default function StickySidebar({ children }) {
    const sidebarRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const sidebar = sidebarRef.current;
        const container = containerRef.current;
        if (!sidebar || !container) return;

        const onScroll = () => {
            const containerRect = container.getBoundingClientRect();
            const sidebarHeight = sidebar.offsetHeight;
            const viewportHeight = window.innerHeight;

            // How far the container top is from the top of the page
            const containerTop = container.getBoundingClientRect().top + window.scrollY;
            const scrollY = window.scrollY;

            // The bottom of the container in page coordinates
            const containerBottomAbs = containerTop + container.offsetHeight;

            // Where the sidebar bottom would be if it were at the bottom of viewport
            const sidebarBottomIfFixed = scrollY + viewportHeight;

            if (sidebarBottomIfFixed < containerTop + sidebarHeight) {
                // Haven't scrolled enough to trigger — keep normal flow
                sidebar.style.position = 'relative';
                sidebar.style.bottom = 'auto';
                sidebar.style.top = 'auto';
                sidebar.style.width = '';
            } else if (sidebarBottomIfFixed >= containerBottomAbs) {
                // Sidebar would go past container bottom — pin to container bottom
                sidebar.style.position = 'absolute';
                sidebar.style.bottom = '0';
                sidebar.style.top = 'auto';
                sidebar.style.width = '';
            } else {
                // In between — fix to viewport bottom
                sidebar.style.position = 'fixed';
                sidebar.style.bottom = '0';
                sidebar.style.top = 'auto';
                sidebar.style.width = container.offsetWidth + 'px';
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        onScroll();
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, []);

    return (
        <div ref={containerRef} className="relative h-full">
            <div ref={sidebarRef}>
                {children}
            </div>
        </div>
    );
}