/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx, scrollbar-hide}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: "#187957",
                "primary-dark": "#0f533b",
                "aceh-green": "#0f392b",
                "aceh-green-light": "#2e7d32",
                "brand-green": "#187957",
                "brand-green-dark": "#0f533b",
                "background-light": "#F3F4F6",
                "background-dark": "#111827",
                "surface-light": "#FFFFFF",
                "surface-dark": "#1F2937",
                "text-light": "#1F2937",
                "text-dark": "#F9FAFB",
                "text-muted-light": "#6B7280",
                "text-muted-dark": "#9CA3AF",
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'sans-serif'],
                display: ['var(--font-oswald)', 'sans-serif'],
                editorial: ['var(--font-playfair)', 'Georgia', 'serif'],
            },
            spacing: {
                '128': '32rem',
            },
        },
    },
    plugins: [],
};
