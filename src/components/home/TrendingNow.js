import Link from 'next/link';

export default function TrendingNow({ articles }) {
    if (!articles) return null;

    return (
        <div className="bg-white dark:bg-surface-dark border dark:border-gray-800 rounded-lg p-4 flex flex-col">
            <h3 className="section-title text-xl font-display font-bold text-gray-900 dark:text-white border-b-2 border-brand-green pb-2 mb-4">
                TRENDING NOW
            </h3>
            <div className="flex flex-col gap-4 flex-grow justify-between">
                {articles.map((item, index) => (
                    <Link key={item.id} href={`/article/${item.slug}`} className="flex items-start gap-4 group cursor-pointer border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0 last:pb-0">
                        <span className="text-3xl font-display font-bold leading-none text-primary group-hover:text-primary transition-colors">
                            0{index + 1}
                        </span>
                        <div>
                            <span className="text-xs font-bold text-gray-400 uppercase mb-1 block">
                                {item.category}
                            </span>
                            <h4 className="font-bold text-sm leading-snug group-hover:text-primary transition-colors text-gray-900 dark:text-white">
                                {item.title}
                            </h4>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
