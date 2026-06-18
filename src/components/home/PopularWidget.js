import Image from 'next/image';
import Link from 'next/link';

export default function PopularWidget({ articles }) {
    const list = (articles || []).slice(0, 7);
    if (!list || list.length === 0) return null;

    return (
        <aside className="bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm overflow-hidden">
            <h3 className="text-base font-black uppercase tracking-wider text-zinc-900 dark:text-white mb-2 pb-2 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center gap-2 font-display">
                Terpopuler
            </h3>
            <div className="flex flex-col">
                {list.map((a, idx) => (
                    <div key={a.id}>
                        <Link href={`/article/${a.slug}`} className="flex gap-3 group py-2">
                            <div className="relative h-15 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                                <Image src={a.image} alt={a.title} fill className="object-cover" />
                            </div>
                            <div className="flex items-center py-0.5">
                                <p className="font-bold text-xs leading-snug group-hover:text-primary dark:group-hover:text-primary text-zinc-800 dark:text-zinc-200 transition-colors">
                                    {a.title}
                                </p>
                            </div>
                        </Link>
                        {idx < list.length - 1 && (
                            <div className="border-b border-zinc-100 dark:border-zinc-800/60" />
                        )}
                    </div>
                ))}
            </div>
        </aside>
    );
}