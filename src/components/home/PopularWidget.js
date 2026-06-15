import Image from 'next/image';
import Link from 'next/link';
export default function PopularWidget({ articles }) {
    const list = (articles || []).slice(0, 9);
    if (!list || list.length === 0) return null;
    return (
        <aside className="flex flex-col h-full bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm overflow-hidden">
            <h3 className="text-base font-black uppercase tracking-wider text-zinc-900 dark:text-white mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center gap-2 font-display">
                Terpopuler
            </h3>
            <div className="flex flex-col flex-1 justify-between overflow-auto py-2">
                {list.map((a) => (
                    <Link key={a.id} href={`/article/${a.slug}`} className="flex gap-3 group">
                        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                            <Image src={a.image} alt={a.title} fill className="object-cover" />
                        </div>
                        <div className="flex flex-col justify-between py-0.5">
                            <p className="font-bold text-xs leading-snug group-hover:text-primary dark:group-hover:text-primary text-zinc-800 dark:text-zinc-200 line-clamp-2 transition-colors">
                                {a.title}
                            </p>
                            <span className="text-[9px] text-zinc-400">
                                {a.publishedAt}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </aside>
    );
}