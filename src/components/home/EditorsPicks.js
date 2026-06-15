import Image from 'next/image';
import Link from 'next/link';

export default function EditorsPicks({ articles }) {
    if (!articles || articles.length === 0) return null;

    const featured = articles[0];
    const list = articles.slice(1);

    return (
        <div className="bg-white dark:bg-surface-dark border dark:border-gray-800 rounded-lg p-4 h-auto lg:h-[620px] flex flex-col">
            <h3 className="section-title text-xl font-display font-bold text-gray-900 dark:text-white border-b-2 border-brand-green pb-2 mb-4">
                PILIHAN REDAKSI
            </h3>

            <div className="flex flex-col gap-4 flex-grow justify-between">
                {/* Featured Pick — with image */}
                <Link href={`/article/${featured.slug}`} className="group cursor-pointer border-b border-gray-100 dark:border-gray-800 pb-4">
                    <div className="relative w-full h-48 mb-3 overflow-hidden rounded bg-gray-100">
                        <Image
                            src={featured.image}
                            alt={featured.title}
                            fill
                            className="object-cover group-hover:scale-110 transition duration-500"
                        />
                        <span className="absolute top-0 left-0 bg-brand-green text-white text-xs font-bold px-2 py-1 font-sans" style={{ textTransform: 'uppercase' }}>
                            {featured.category}
                        </span>
                    </div>
                    <h4 className="font-bold text-sm leading-snug group-hover:text-primary transition-colors text-gray-900 dark:text-white">
                        {featured.title}
                    </h4>
                </Link>

                {/* List Picks — same as TrendingNow items */}
                {list.map((item) => (
                    <Link key={item.id} href={`/article/${item.slug}`} className="group cursor-pointer border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0 last:pb-0">
                       <span className="text-xs font-bold text-brand-green !uppercase mb-1 block font-sans">
                            {item.category}
                        </span>
                        <h4 className="font-bold text-sm leading-snug group-hover:text-primary transition-colors text-gray-900 dark:text-white">
                            {item.title}
                        </h4>
                    </Link>
                ))}
            </div>
        </div>
    );
}