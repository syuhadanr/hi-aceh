import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import DashboardChart from "@/components/admin/dashboard-chart";
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  Eye,
  FileText,
  MousePointerClick,
  Newspaper,
  Users,
} from "lucide-react";

export const revalidate = 0;

type DashboardSearchParams = Promise<{
  from?: string;
  to?: string;
}>;

function toInputDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfDateInput(value: string | undefined, fallback: Date) {
  const date = value ? new Date(`${value}T00:00:00`) : fallback;
  if (Number.isNaN(date.getTime())) return fallback;
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDateInput(value: string | undefined, fallback: Date) {
  const date = value ? new Date(`${value}T23:59:59.999`) : fallback;
  if (Number.isNaN(date.getTime())) return fallback;
  date.setHours(23, 59, 59, 999);
  return date;
}

function eachDay(from: Date, to: Date) {
  const days: Date[] = [];
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  while (cursor <= end && days.length < 45) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function isMobile(userAgent?: string | null) {
  const ua = userAgent?.toLowerCase() || "";
  return ua.includes("mobi") || ua.includes("android") || ua.includes("iphone");
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: DashboardSearchParams;
}) {
  const params = await searchParams;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const defaultFrom = new Date(todayStart);
  defaultFrom.setDate(defaultFrom.getDate() - 6);

  let rangeFrom = startOfDateInput(params?.from, defaultFrom);
  let rangeTo = endOfDateInput(params?.to, todayEnd);
  if (rangeFrom > rangeTo) {
    [rangeFrom, rangeTo] = [startOfDateInput(params?.to, defaultFrom), endOfDateInput(params?.from, todayEnd)];
  }

  const fiveMinutesAgo = new Date();
  fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

  const [
    totalArticles,
    publishedArticles,
    pendingArticles,
    draftArticles,
    totalViews,
    totalUniqueVisitors,
    viewsInRange,
    uniqueVisitorsInRange,
    visitorsToday,
    onlineNow,
    pageViewsInRange,
    popularArticles,
    recentArticles,
  ] = await Promise.all([
    db.article.count({ where: { deletedAt: null } }),
    db.article.count({ where: { deletedAt: null, status: "PUBLISHED" } }),
    db.article.count({ where: { deletedAt: null, status: "PENDING" } }),
    db.article.count({ where: { deletedAt: null, status: "DRAFT" } }),
    db.pageView.count(),
    db.pageView.groupBy({ by: ["ipHash"] }).then((rows) => rows.length),
    db.pageView.count({ where: { viewedAt: { gte: rangeFrom, lte: rangeTo } } }),
    db.pageView
      .groupBy({ by: ["ipHash"], where: { viewedAt: { gte: rangeFrom, lte: rangeTo } } })
      .then((rows) => rows.length),
    db.pageView.count({ where: { viewedAt: { gte: todayStart, lte: todayEnd } } }),
    db.pageView
      .groupBy({ by: ["ipHash"], where: { viewedAt: { gte: fiveMinutesAgo } } })
      .then((rows) => rows.length),
    db.pageView.findMany({
      where: { viewedAt: { gte: rangeFrom, lte: rangeTo } },
      select: { viewedAt: true, userAgent: true },
    }),
    db.article.findMany({
      where: { deletedAt: null },
      orderBy: { viewCount: "desc" },
      take: 8,
      select: {
        id: true, title: true, viewCount: true, slug: true,
        category: { select: { name: true } },
      },
    }),
    db.article.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 7,
      include: {
        author: { select: { name: true } },
        category: { select: { name: true } },
      },
    }),
  ]);

  const formatNumber = (num: number) => new Intl.NumberFormat("id-ID").format(num);
  const dateRangeLabel = `${rangeFrom.toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
  })} - ${rangeTo.toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
  })}`;

  // Pass ISO date string so chart can group by week/month client-side
  const chartData = eachDay(rangeFrom, rangeTo).map((date) => {
    const dateKey = date.toDateString();
    const viewsForDay = pageViewsInRange.filter(
      (pv) => new Date(pv.viewedAt).toDateString() === dateKey
    );
    return {
      day: date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
      date: date.toISOString().slice(0, 10),
      Desktop: viewsForDay.filter((pv) => !isMobile(pv.userAgent)).length,
      Mobile: viewsForDay.filter((pv) => isMobile(pv.userAgent)).length,
    };
  });

  // Stat card definitions
  const stats = [
    {
      title: "Total Pengunjung",
      value: formatNumber(totalViews),
      sub: "Semua kunjungan",
      icon: Eye,
      accent: "from-teal-500/10 to-transparent",
      iconColor: "text-teal-500",
      border: "border-teal-500/20",
    },
    {
      title: "Pengunjung Unik",
      value: formatNumber(totalUniqueVisitors),
      sub: "Sepanjang waktu",
      icon: Users,
      accent: "from-indigo-500/10 to-transparent",
      iconColor: "text-indigo-500",
      border: "border-indigo-500/20",
    },
    {
      title: "Views Periode",
      value: formatNumber(viewsInRange),
      sub: dateRangeLabel,
      icon: CalendarDays,
      accent: "from-emerald-500/10 to-transparent",
      iconColor: "text-emerald-500",
      border: "border-emerald-500/20",
    },
    {
      title: "Unik Periode",
      value: formatNumber(uniqueVisitorsInRange),
      sub: dateRangeLabel,
      icon: MousePointerClick,
      accent: "from-amber-500/10 to-transparent",
      iconColor: "text-amber-500",
      border: "border-amber-500/20",
    },
    {
      title: "Hari Ini",
      value: formatNumber(visitorsToday),
      sub: "Kunjungan hari ini",
      icon: Activity,
      accent: "from-rose-500/10 to-transparent",
      iconColor: "text-rose-500",
      border: "border-rose-500/20",
    },
    {
      title: "Online Sekarang",
      value: formatNumber(onlineNow),
      sub: "Aktif 5 menit terakhir",
      icon: Activity,
      accent: "from-lime-500/10 to-transparent",
      iconColor: "text-lime-500",
      border: "border-lime-500/20",
      pulse: true,
    },
    {
      title: "Total Artikel",
      value: formatNumber(totalArticles),
      sub: `${publishedArticles} terbit, ${pendingArticles} menunggu`,
      icon: FileText,
      accent: "from-sky-500/10 to-transparent",
      iconColor: "text-sky-500",
      border: "border-sky-500/20",
    },
    {
      title: "Draft",
      value: formatNumber(draftArticles),
      sub: "Belum diterbitkan",
      icon: Newspaper,
      accent: "from-zinc-500/10 to-transparent",
      iconColor: "text-zinc-400",
      border: "border-zinc-500/20",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Page header + date filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Dashboard Analitik
        </h2>

        <form className="flex flex-wrap items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 self-start sm:self-auto shrink-0">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 whitespace-nowrap"></label>
          <input
            type="date"
            name="from"
            defaultValue={toInputDate(rangeFrom)}
            className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-2 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 min-w-0 flex-1 sm:w-[130px] sm:flex-none"
          />
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 whitespace-nowrap">–</label>
          <input
            type="date"
            name="to"
            defaultValue={toInputDate(rangeTo)}
            className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-2 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 min-w-0 flex-1 sm:w-[130px] sm:flex-none"
          />
          <button className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-500 whitespace-nowrap">
            Terapkan
          </button>
        </form>
      </div>

      {/* Stat cards — shadcn-inspired, 4 cols */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className={`relative overflow-hidden rounded-xl border bg-white dark:bg-zinc-950 shadow-sm ${stat.border} dark:border-opacity-40`}
            >
              {/* Subtle gradient wash */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.accent} pointer-events-none`} />

              <div className="relative p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    {stat.title}
                  </p>
                  <Icon className={`h-3.5 w-3.5 ${stat.iconColor}`} />
                </div>

                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-none">
                    {stat.value}
                  </span>
                  {stat.pulse && (
                    <span className="relative flex h-2 w-2 mb-0.5 shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                  )}
                </div>

                <p className="mt-1.5 text-[10px] text-zinc-400 leading-snug truncate">
                  {stat.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <DashboardChart data={chartData} subtitle={dateRangeLabel} />

      {/* Popular + Recent articles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              <Eye className="h-4 w-4 text-teal-500" />
              Artikel Terpopuler
            </h3>
            <span className="text-[10px] font-bold uppercase text-zinc-400">All time</span>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
            {popularArticles.map((art, index) => (
              <Link key={art.id} href={`/admin/articles/${art.id}/edit`} className="flex items-center gap-3 py-3 text-xs hover:text-teal-500">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold text-zinc-500">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-zinc-700 dark:text-zinc-300">{art.title}</span>
                  <span className="mt-0.5 block text-[10px] text-zinc-400">{art.category?.name || "Kategori"}</span>
                </span>
                <span className="rounded-md bg-zinc-100 dark:bg-zinc-900 px-2 py-1 text-[10px] font-bold text-zinc-500">
                  {formatNumber(art.viewCount)}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden sm:block rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              <FileText className="h-4 w-4 text-indigo-500" />
              Artikel Terbaru
            </h3>
            <Link href="/admin/articles" className="flex items-center gap-1 text-[10px] font-bold uppercase text-teal-500 hover:text-teal-400">
              Lihat Semua <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-100 dark:border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="py-2.5">Judul</th>
                  <th className="py-2.5">Penulis</th>
                  <th className="py-2.5">Rubrik</th>
                  <th className="py-2.5">Tanggal</th>
                  <th className="py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {recentArticles.map((art) => (
                  <tr key={art.id}>
                    <td className="max-w-[220px] truncate py-3 font-semibold text-zinc-700 dark:text-zinc-300">{art.title}</td>
                    <td className="py-3 text-zinc-500">{art.author?.name}</td>
                    <td className="py-3 text-zinc-500">{art.category?.name}</td>
                    <td className="py-3 text-zinc-400">
                      {new Date(art.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </td>
                    <td className="py-3 text-right">
                      <span className="rounded border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 text-[9px] font-bold uppercase text-zinc-500">
                        {art.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}