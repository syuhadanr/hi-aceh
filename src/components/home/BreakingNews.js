import { db } from '@/lib/db';
import BreakingNewsTicker from './BreakingNewsTicker';

export default async function BreakingNews() {
    // Fetch real breaking news articles from DB
    let breakingItems = [];
    try {
        const articles = await db.article.findMany({
            where: {
                isBreaking: true,
                status: 'PUBLISHED',
                deletedAt: null,
            },
            orderBy: { publishedAt: 'desc' },
            take: 5,
            select: {
                id: true,
                title: true,
                slug: true,
                publishedAt: true,
            },
        });

        breakingItems = articles.map((a) => ({
            id: a.id,
            title: a.title,
            slug: a.slug,
            time: a.publishedAt
                ? new Date(a.publishedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                : '',
        }));
    } catch (e) {
        // fallback: empty
    }

    // Fallback static items if no breaking news in DB
    const items = breakingItems.length > 0 ? breakingItems : [
        { id: '1', title: 'Magnitudo 5.2 guncang perairan Sabang; tidak ada peringatan tsunami saat ini.', slug: null, time: '' },
        { id: '2', title: 'Hujan lebat diperkirakan di wilayah Sumatera Utara selama 24 jam ke depan.', slug: null, time: '' },
        { id: '3', title: 'Gubernur umumkan rencana infrastruktur baru untuk transportasi publik Banda Aceh.', slug: null, time: '' },
    ];

    return <BreakingNewsTicker items={items} />;
}
