import Link from 'next/link';
import { Play } from 'lucide-react';

export default function UpNextSidebar({ recommendations }) {
    const recs = recommendations && recommendations.length > 0 ? recommendations : [
        {
            id: "placeholder-1",
            title: "Governor's Speech on New Infrastructure Projects",
            author: "Politics Desk",
            publishedAt: "2 hours ago",
            views: "15K views",
            duration: "1:20",
            image: "https://picsum.photos/seed/politics/200/300"
        },
        {
            id: "placeholder-2",
            title: "Culinary Journey: Best Mie Aceh in Town",
            author: "Lifestyle",
            publishedAt: "5 hours ago",
            views: "32K views",
            duration: "0:45",
            image: "https://picsum.photos/seed/food/200/300"
        }
    ];

    return (
        <div className="w-full md:w-[380px] lg:w-[420px] bg-white dark:bg-zinc-900 border-l border-[#e6e6e6] dark:border-zinc-800 overflow-y-auto z-10 flex flex-col h-[50vh] md:h-auto shadow-2xl">
            <div className="p-6 border-b border-[#e6e6e6] dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-30">
                <h3 className="text-[#111418] dark:text-white text-lg font-bold">Up Next</h3>
                <p className="text-[#637588] dark:text-zinc-400 text-sm mt-1">Recommended for you</p>
            </div>

            <div className="p-4 flex flex-col gap-4">
                {recs.map((item) => (
                    <Link href={`/briefs/${item.id}`} key={item.id} className="group flex gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800/30 cursor-pointer transition-colors">
                        <div className="relative w-[80px] h-[142px] shrink-0 rounded-lg overflow-hidden bg-gray-800">
                            {/* Placeholder image style from reference */}
                            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url('${item.image}')` }}></div>
                            <div className="absolute bottom-1 right-1 bg-black/60 px-1 rounded text-[10px] text-white font-medium">{item.duration || "1:00"}</div>
                        </div>

                        <div className="flex flex-col justify-center gap-1 font-sans">
                            <h4 className="text-[#111418] dark:text-white text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                                {item.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-4 h-4 rounded-full bg-brand-green flex items-center justify-center text-white text-[8px] font-bold">AP</div>
                                <span className="text-[#637588] dark:text-zinc-400 text-xs">{item.author}</span>
                            </div>
                            <span className="text-[#637588] dark:text-zinc-400 text-xs">{item.publishedAt} • {item.views || "1.2K views"}</span>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="mt-auto p-4 border-t border-[#e6e6e6] dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <button className="w-full py-3 rounded-lg bg-[#f0f2f4] dark:bg-zinc-800 text-[#111418] dark:text-white font-bold text-sm hover:bg-[#e0e2e4] dark:hover:bg-zinc-700 transition-colors">
                    Load More Briefs
                </button>
            </div>
        </div>
    );
}
