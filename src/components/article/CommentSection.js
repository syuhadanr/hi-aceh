'use client';

import { useState } from 'react';

function timeAgo(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return 'Baru saja';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} menit lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getInitials(name) {
    return name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('');
}

export default function CommentSection({ articleId, initialCount = 0 }) {
    const [showForm, setShowForm] = useState(false);
    const [showList, setShowList] = useState(false);
    const [comments, setComments] = useState([]);
    const [count, setCount] = useState(initialCount);
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [body, setBody] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleShowList = () => {
        setShowList((prev) => !prev);
        if (!fetched) {
            setFetched(true);
            setLoading(true);
            fetch(`/api/comments?articleId=${articleId}`)
                .then((res) => res.ok ? res.json() : null)
                .then((data) => {
                    if (data) {
                        setComments(data.comments || []);
                        setCount(data.comments?.length ?? initialCount);
                    }
                })
                .catch(() => { })
                .finally(() => setLoading(false));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        if (!name.trim()) { setError('Nama wajib diisi.'); return; }
        if (!body.trim()) { setError('Komentar tidak boleh kosong.'); return; }
        setSubmitting(true);
        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ articleId, name, email, commentBody: body }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Gagal mengirim komentar.');
            } else {
                setComments((prev) => [...prev, data.comment]);
                setCount((prev) => prev + 1);
                setName(''); setEmail(''); setBody('');
                setSuccess(true);
                setShowList(true);
                setTimeout(() => setSuccess(false), 4000);
            }
        } catch {
            setError('Terjadi kesalahan jaringan. Silakan coba lagi.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="mb-12 border-t border-gray-100 dark:border-zinc-800 pt-6">
            {/* Header row */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 border-l-4 border-brand-green pl-3 shrink-0">
                    <h3 className="text-base font-sans font-bold uppercase text-gray-900 dark:text-white">
                        Komentar
                    </h3>
                    <span className="bg-brand-green text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[24px] text-center">
                        {count}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowForm((prev) => !prev)}
                        className="flex items-center gap-1 text-[11px] font-bold uppercase text-white bg-brand-green hover:bg-brand-green-dark px-2.5 py-1.5 rounded transition-colors whitespace-nowrap"
                    >
                        <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
                        </svg>
                        Tulis<span className="hidden sm:inline"> Komentar</span>
                        <svg className={`w-3 h-3 shrink-0 transition-transform duration-300 ${showForm ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={handleShowList}
                        className="flex items-center gap-1 text-[11px] font-bold uppercase text-brand-green border border-brand-green hover:bg-brand-green/10 px-2.5 py-1.5 rounded transition-colors whitespace-nowrap"
                    >
                        <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.92 1.786c-.082.1-.098.24-.041.354.058.115.175.186.304.186 1.63 0 3.14-.582 4.316-1.554.218-.18.497-.247.781-.194a8.974 8.974 0 002.203.268z" />
                        </svg>
                        Lihat<span className="hidden sm:inline"> Komentar</span>
                        <svg className={`w-3 h-3 shrink-0 transition-transform duration-300 ${showList ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Comment Form */}
            {showForm && (
                <div className="mt-6 bg-gray-50 dark:bg-zinc-900 p-4 sm:p-6 border border-gray-100 dark:border-zinc-800 rounded-lg">
                    <h4 className="text-sm font-bold uppercase mb-5 font-sans text-gray-700 dark:text-zinc-300 flex items-center gap-2">
                        <svg className="w-4 h-4 text-brand-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
                        </svg>
                        Tinggalkan Komentar
                    </h4>

                    {success && (
                        <div className="flex items-center gap-2 bg-brand-green/10 border border-brand-green/30 text-brand-green text-sm px-4 py-3 rounded mb-4 font-sans">
                            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                            Komentar berhasil dikirim! Terima kasih.
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 text-sm px-4 py-3 rounded mb-4 font-sans">
                            <svg className="w-4 h-4 shrink-0 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 8v4" /><path d="M12 16h.01" /><circle cx="12" cy="12" r="10" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-zinc-400 mb-1.5 font-sans">
                                    Nama <span className="text-brand-green">*</span>
                                </label>
                                <input
                                    type="text" value={name} onChange={(e) => setName(e.target.value)}
                                    placeholder="Nama Anda" maxLength={100}
                                    className="w-full border border-gray-200 dark:border-zinc-700 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-green bg-white dark:bg-zinc-950 rounded text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-zinc-400 mb-1.5 font-sans">
                                    Email <span className="text-gray-400 font-normal normal-case">(opsional)</span>
                                </label>
                                <input
                                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@contoh.com"
                                    className="w-full border border-gray-200 dark:border-zinc-700 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-green bg-white dark:bg-zinc-950 rounded text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 transition-colors"
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-xs font-bold uppercase text-gray-500 dark:text-zinc-400 mb-1.5 font-sans">
                                Komentar <span className="text-brand-green">*</span>
                            </label>
                            <textarea
                                value={body} onChange={(e) => setBody(e.target.value)}
                                className="w-full border border-gray-200 dark:border-zinc-700 p-4 text-sm focus:outline-none focus:border-brand-green h-32 bg-white dark:bg-zinc-950 rounded text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 transition-colors resize-none"
                                placeholder="Tulis komentar Anda..." maxLength={2000} required
                            />
                            <div className="text-right text-xs text-gray-400 mt-1">{body.length}/2000</div>
                        </div>
                        <button
                            type="submit" disabled={submitting}
                            className="bg-brand-green hover:bg-brand-green-dark disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold uppercase px-6 py-3 rounded transition-colors flex items-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Mengirim...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="22" y1="2" x2="11" y2="13" />
                                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                    </svg>
                                    Kirim Komentar
                                </>
                            )}
                        </button>
                    </form>
                </div>
            )}

            {/* Comment List */}
            {showList && (
                <div className="mt-6">
                    {loading ? (
                        <div className="space-y-6">
                            {[1, 2].map((i) => (
                                <div key={i} className="flex gap-4 animate-pulse">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-700 shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-1/4" />
                                        <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-3/4" />
                                        <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <svg className="w-12 h-12 text-gray-300 dark:text-zinc-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.92 1.786c-.082.1-.098.24-.041.354.058.115.175.186.304.186 1.63 0 3.14-.582 4.316-1.554.218-.18.497-.247.781-.194a8.974 8.974 0 002.203.268z" />
                            </svg>
                            <p className="text-gray-400 dark:text-zinc-500 text-sm font-sans">
                                Belum ada komentar. Jadilah yang pertama berkomentar!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {comments.map((c) => (
                                <div key={c.id} className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center text-white font-bold text-sm shrink-0 font-sans">
                                        {getInitials(c.name)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-lg px-4 py-3">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-bold text-sm text-gray-900 dark:text-white font-sans">{c.name}</span>
                                                <span className="text-xs text-gray-400 dark:text-zinc-500 font-sans">{timeAgo(c.createdAt)}</span>
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap">{c.body}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}