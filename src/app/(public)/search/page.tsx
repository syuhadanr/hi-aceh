import { getAllArticles } from '@/lib/data';
import TopBar from '@/components/layout/TopBar';
import HeaderNav from '@/components/layout/HeaderNav';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';
import Link from 'next/link';

interface SearchPageProps {
  searchParams: Promise<{ q?: string; sort?: string; category?: string; date?: string; page?: string }>;
}

export const dynamic = 'force-dynamic';

const PER_PAGE = 15;

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '', sort = 'newest', category = '', date = '', page: pageParam = '1' } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam, 10));

  const allArticles = await getAllArticles() as any[];

  let results = allArticles.filter((a: any) =>
    !q || a.title?.toLowerCase().includes(q.toLowerCase()) ||
    a.excerpt?.toLowerCase().includes(q.toLowerCase()) ||
    a.content?.toLowerCase().includes(q.toLowerCase())
  );

  if (category) {
    results = results.filter((a: any) => a.categorySlug === category);
  }

  if (date) {
    const now = new Date();
    const cutoff = new Date();
    if (date === 'week') cutoff.setDate(now.getDate() - 7);
    else if (date === 'month') cutoff.setMonth(now.getMonth() - 1);
    else if (date === 'year') cutoff.setFullYear(now.getFullYear() - 1);
    results = results.filter((a: any) => {
      const pub = new Date(a.publishedAt || '');
      return !isNaN(pub.getTime()) && pub >= cutoff;
    });
  }

  if (sort === 'oldest') results = [...results].reverse();

  const totalResults = results.length;
  const totalPages = Math.ceil(totalResults / PER_PAGE);
  const pagedResults = results.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const allCategories = Array.from(new Set(allArticles.map((a: any) => a.categorySlug)))
    .map(slug => ({
      slug,
      name: allArticles.find((a: any) => a.categorySlug === slug)?.category || slug,
    }));

  const buildUrl = (params: Record<string, string>) => {
    const p = new URLSearchParams({ q, sort, category, date, page: '1', ...params });
    ['sort', 'category', 'date'].forEach(k => { if (!p.get(k)) p.delete(k); });
    if (p.get('page') === '1') p.delete('page');
    return `/search?${p.toString()}`;
  };

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams({ q, sort, category, date });
    ['sort', 'category', 'date'].forEach(k => { if (!params.get(k)) params.delete(k); });
    if (p > 1) params.set('page', String(p));
    return `/search?${params.toString()}`;
  };

  const activeCategoryName = category
    ? allCategories.find(c => c.slug === category)?.name || category
    : 'Semua';

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen flex flex-col font-sans text-gray-900 dark:text-gray-100">
      <TopBar />
      <HeaderNav activeCategory={null} />

      <div className="container mx-auto px-4 py-6 max-w-[1200px] flex-grow">

        {/* Page Title */}
        <h1 className="text-xl sm:text-4xl font-display font-black uppercase tracking-tight text-gray-900 dark:text-white border-b-4 border-gray-900 dark:border-white pb-3 mb-4">
          Pencarian
        </h1>

        {/* Search bar */}
        <form method="GET" action="/search" className="flex items-center mb-5 border border-gray-300 dark:border-zinc-700 rounded overflow-hidden">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Ketik untuk mencari..."
            className="flex-1 px-3 py-2 text-xs sm:px-4 sm:py-3 sm:text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none font-sans"
          />
          <button type="submit" className="px-3 py-2 sm:px-4 sm:py-3 bg-brand-green text-white hover:bg-green-700 transition-colors flex items-center">
            <i className="material-icons text-base sm:text-lg">search</i>
          </button>
        </form>

        {/* ── MOBILE FILTERS — single line NYPost style ── */}
        {q && (
          <div className="sm:hidden mb-4">
            <p className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              {totalResults} hasil untuk <span className="text-gray-900 dark:text-white">"{q}"</span>
            </p>
            <div className="flex items-center flex-wrap gap-x-1 gap-y-1 text-[11px] font-bold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-700 pb-2">
              <span className="text-zinc-400 shrink-0">Urut:</span>
              {[{ label: 'Terbaru', value: 'newest' }, { label: 'Terlama', value: 'oldest' }].map((opt, i) => (
                <span key={opt.value} className="flex items-center">
                  {i > 0 && <span className="text-zinc-300 dark:text-zinc-600 mx-1">|</span>}
                  <Link href={buildUrl({ sort: opt.value })}
                    className={sort === opt.value ? 'text-brand-green' : 'text-zinc-400 hover:text-brand-green'}>
                    {opt.label}
                  </Link>
                </span>
              ))}
              <span className="text-zinc-300 dark:text-zinc-600 mx-1">·</span>
              <details className="relative inline-block">
                <summary className="list-none cursor-pointer flex items-center gap-0.5 select-none">
                  <span className={category ? 'text-brand-green' : 'text-zinc-400'}>
                    {activeCategoryName}
                  </span>
                  <i className="material-icons text-[12px] text-zinc-400 leading-none">expand_more</i>
                </summary>
                <div className="absolute left-0 top-full mt-1 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg py-1 min-w-[140px]">
                  <Link href={buildUrl({ category: '' })}
                    className={`block px-4 py-2 text-[11px] font-bold uppercase tracking-wider hover:bg-zinc-50 dark:hover:bg-zinc-800 ${!category ? 'text-brand-green' : 'text-zinc-600 dark:text-zinc-300'}`}>
                    Semua
                  </Link>
                  {allCategories.map((cat: any) => (
                    <Link key={cat.slug} href={buildUrl({ category: cat.slug })}
                      className={`block px-4 py-2 text-[11px] font-bold uppercase tracking-wider hover:bg-zinc-50 dark:hover:bg-zinc-800 ${category === cat.slug ? 'text-brand-green' : 'text-zinc-600 dark:text-zinc-300'}`}>
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </details>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-10">

          {/* Sidebar Filters — desktop only */}
          <aside className="hidden sm:flex sm:flex-col sm:justify-end lg:w-56 shrink-0">
            <div className="space-y-8 sticky bottom-0">
              <div>
                <h3 className="text-lg font-black uppercase tracking-widest text-gray-900 dark:text-white border-b-2 border-brand-green pb-1 mb-3 font-display">Urutkan</h3>
                <ul className="space-y-1 text-sm">
                  {[{ label: 'Terbaru', value: 'newest' }, { label: 'Terlama', value: 'oldest' }].map(opt => (
                    <li key={opt.value}>
                      <Link href={buildUrl({ sort: opt.value })} className={`block py-1 px-2 rounded transition-colors ${sort === opt.value ? 'font-bold text-brand-green bg-green-50 dark:bg-green-950/30' : 'text-gray-600 dark:text-zinc-400 hover:text-brand-green'}`}>
                        {opt.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-display font-black uppercase tracking-widest text-gray-900 dark:text-white border-b-2 border-brand-green pb-1 mb-3">Rentang Waktu</h3>
                <ul className="space-y-1 text-sm">
                  {[{ label: 'Semua', value: '' }, { label: '7 Hari Terakhir', value: 'week' }, { label: '30 Hari Terakhir', value: 'month' }, { label: 'Tahun Ini', value: 'year' }].map(opt => (
                    <li key={opt.value}>
                      <Link href={buildUrl({ date: opt.value })} className={`block py-1 px-2 rounded transition-colors ${date === opt.value ? 'font-bold text-brand-green bg-green-50 dark:bg-green-950/30' : 'text-gray-600 dark:text-zinc-400 hover:text-brand-green'}`}>
                        {opt.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-display font-black uppercase tracking-widest text-gray-900 dark:text-white border-b-2 border-brand-green pb-1 mb-3">Rubrik</h3>
                <ul className="space-y-1 text-sm">
                  <li>
                    <Link href={buildUrl({ category: '' })} className={`block py-1 px-2 rounded transition-colors ${!category ? 'font-bold text-brand-green bg-green-50 dark:bg-green-950/30' : 'text-gray-600 dark:text-zinc-400 hover:text-brand-green'}`}>
                      Semua Rubrik
                    </Link>
                  </li>
                  {allCategories.map((cat: any) => (
                    <li key={cat.slug}>
                      <Link href={buildUrl({ category: cat.slug })} className={`block py-1 px-2 rounded transition-colors ${category === cat.slug ? 'font-bold text-brand-green bg-green-50 dark:bg-green-950/30' : 'text-gray-600 dark:text-zinc-400 hover:text-brand-green'}`}>
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1">

            {/* Desktop result count */}
            {q && (
              <p className="hidden sm:block text-sm font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-6 pb-4 border-b border-gray-200 dark:border-zinc-800">
                {totalResults} hasil untuk <span className="text-gray-900 dark:text-white">"{q}"</span>
              </p>
            )}

            {pagedResults.length === 0 ? (
              <div className="text-center py-20 text-gray-400 dark:text-zinc-600">
                <i className="material-icons text-5xl mb-4 block">search_off</i>
                <p className="text-lg font-bold">Tidak ada artikel ditemukan.</p>
                <p className="text-sm mt-1">Coba kata kunci lain atau ubah filter.</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {pagedResults.map((article: any) => (
                  <article key={article.id} className="group">

                    {/* Mobile: compact row */}
                    <Link href={`/article/${article.slug}`}
                      className="sm:hidden flex items-center gap-3 py-3 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="relative w-16 h-12 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-900">
                        <Image src={article.image} alt={article.title} fill className="object-cover" />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0 gap-0.5">
                        <span className="text-[10px] font-bold text-brand-green uppercase tracking-wider">{article.category}</span>
                        <h2 className="font-bold text-sm leading-snug text-zinc-900 dark:text-white line-clamp-2 group-hover:text-brand-green transition-colors">{article.title}</h2>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{article.publishedAt}</span>
                      </div>
                    </Link>

                    {/* Desktop layout */}
                    <div className="hidden sm:flex gap-5 bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-4 mb-4 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="relative w-52 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900 aspect-[4/3]">
                        <Image src={article.image} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        <span className="absolute top-3 left-3 bg-zinc-950/80 text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded backdrop-blur-sm">
                          {article.category}
                        </span>
                      </div>
                      <div className="flex flex-col flex-1 justify-between py-1 gap-2">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[11px] font-semibold text-brand-green uppercase tracking-wider">{article.author}</span>
                          <Link href={`/article/${article.slug}`}>
                            <h2 className="font-bold text-xl sm:text-2xl leading-snug group-hover:text-brand-green text-zinc-900 dark:text-white line-clamp-2 transition-colors">
                              {article.title}
                            </h2>
                          </Link>
                          {article.excerpt && (
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm line-clamp-2 mt-1">{article.excerpt}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-500 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                          <span>{article.publishedAt}</span>
                        </div>
                      </div>
                    </div>

                  </article>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <>
                {/* Mobile pagination: windowed with ellipsis */}
                {(() => {
                  const pages: (number | '...')[] = [];
                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    if (currentPage > 3) pages.push('...');
                    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
                    if (currentPage < totalPages - 2) pages.push('...');
                    pages.push(totalPages);
                  }
                  return (
                    <div className="sm:hidden flex items-center justify-center gap-1 mt-8 flex-wrap">
                      {currentPage > 1 ? (
                        <Link href={buildPageUrl(currentPage - 1)} className="flex items-center px-3 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">←</Link>
                      ) : (
                        <span className="flex items-center px-3 py-2 text-sm font-semibold text-zinc-300 dark:text-zinc-600 border border-zinc-100 dark:border-zinc-800 rounded-xl cursor-not-allowed">←</span>
                      )}
                      {pages.map((p, i) =>
                        p === '...' ? (
                          <span key={`ellipsis-${i}`} className="w-8 h-9 flex items-center justify-center text-sm text-zinc-400 dark:text-zinc-500">…</span>
                        ) : (
                          <Link key={p} href={buildPageUrl(p as number)}
                            className={`w-9 h-9 flex items-center justify-center text-sm font-bold rounded-xl transition-colors ${p === currentPage ? 'bg-brand-green text-white' : 'text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                          >{p}</Link>
                        )
                      )}
                      {currentPage < totalPages ? (
                        <Link href={buildPageUrl(currentPage + 1)} className="flex items-center px-3 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">→</Link>
                      ) : (
                        <span className="flex items-center px-3 py-2 text-sm font-semibold text-zinc-300 dark:text-zinc-600 border border-zinc-100 dark:border-zinc-800 rounded-xl cursor-not-allowed">→</span>
                      )}
                    </div>
                  );
                })()}

                {/* Desktop pagination: full page numbers */}
                <div className="hidden sm:flex items-center justify-center gap-2 mt-10 flex-wrap">
                  {currentPage > 1 ? (
                    <Link href={buildPageUrl(currentPage - 1)} className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                      ← Prev
                    </Link>
                  ) : (
                    <span className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-zinc-300 dark:text-zinc-600 border border-zinc-100 dark:border-zinc-800 rounded-xl cursor-not-allowed">← Prev</span>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link key={p} href={buildPageUrl(p)}
                      className={`w-9 h-9 flex items-center justify-center text-sm font-bold rounded-xl transition-colors ${p === currentPage ? 'bg-brand-green text-white' : 'text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                    >{p}</Link>
                  ))}
                  {currentPage < totalPages ? (
                    <Link href={buildPageUrl(currentPage + 1)} className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                      Next →
                    </Link>
                  ) : (
                    <span className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-zinc-300 dark:text-zinc-600 border border-zinc-100 dark:border-zinc-800 rounded-xl cursor-not-allowed">Next →</span>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}