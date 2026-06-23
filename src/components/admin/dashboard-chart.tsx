"use client";

import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface ChartDataPoint {
  day: string;
  date: string; // ISO date string for grouping
  Desktop: number;
  Mobile: number;
}

interface DashboardChartProps {
  data: ChartDataPoint[];
  subtitle?: string;
}

type Period = "harian" | "mingguan" | "bulanan";

const PERIODS: { key: Period; label: string }[] = [
  { key: "harian", label: "Harian" },
  { key: "mingguan", label: "Mingguan" },
  { key: "bulanan", label: "Bulanan" },
];

function groupByWeek(data: ChartDataPoint[]): ChartDataPoint[] {
  const map = new Map<string, ChartDataPoint>();
  for (const d of data) {
    const date = new Date(d.date);
    // Get Monday of the week
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1 - day);
    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);
    const key = monday.toISOString().slice(0, 10);
    const label = monday.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
    if (!map.has(key)) {
      map.set(key, { day: label, date: key, Desktop: 0, Mobile: 0 });
    }
    const entry = map.get(key)!;
    entry.Desktop += d.Desktop;
    entry.Mobile += d.Mobile;
  }
  return Array.from(map.values());
}

function groupByMonth(data: ChartDataPoint[]): ChartDataPoint[] {
  const map = new Map<string, ChartDataPoint>();
  for (const d of data) {
    const date = new Date(d.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
    if (!map.has(key)) {
      map.set(key, { day: label, date: key, Desktop: 0, Mobile: 0 });
    }
    const entry = map.get(key)!;
    entry.Desktop += d.Desktop;
    entry.Mobile += d.Mobile;
  }
  return Array.from(map.values());
}

export default function DashboardChart({ data, subtitle }: DashboardChartProps) {
  const [period, setPeriod] = useState<Period>("harian");
  const [showDesktop, setShowDesktop] = useState(true);
  const [showMobile, setShowMobile] = useState(true);

  const chartData = useMemo(() => {
    if (period === "mingguan") return groupByWeek(data);
    if (period === "bulanan") return groupByMonth(data);
    return data;
  }, [data, period]);

  return (
    <div className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 shadow-lg">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">Tren Pengunjung</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            {subtitle || "Perbandingan traffic desktop vs mobile"}
          </p>
        </div>

        {/* Period toggle */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 shrink-0">
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                period === key
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend toggles */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => setShowDesktop((v) => !v)}
          className={`flex items-center gap-2 text-xs font-medium transition-opacity cursor-pointer select-none ${
            showDesktop ? "opacity-100" : "opacity-35"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
          <span className="text-zinc-400">Desktop</span>
        </button>
        <button
          onClick={() => setShowMobile((v) => !v)}
          className={`flex items-center gap-2 text-xs font-medium transition-opacity cursor-pointer select-none ${
            showMobile ? "opacity-100" : "opacity-35"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          <span className="text-zinc-400">Mobile</span>
        </button>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 16 }}>
          <defs>
            <linearGradient id="colorDesktop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorMobile" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis
            dataKey="day"
            stroke="#71717a"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            dy={8}
          />
          <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#09090b",
              borderColor: "#27272a",
              borderRadius: "10px",
              color: "#f4f4f5",
              fontSize: "12px",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.5)",
            }}
            itemStyle={{ padding: "2px 0" }}
            labelStyle={{ fontWeight: 600, color: "#a1a1aa", marginBottom: "4px" }}
          />
          {showDesktop && (
            <Area
              type="monotone"
              dataKey="Desktop"
              stroke="#14b8a6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorDesktop)"
            />
          )}
          {showMobile && (
            <Area
              type="monotone"
              dataKey="Mobile"
              stroke="#6366f1"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorMobile)"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}