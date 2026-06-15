"use client";

import React from "react";
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
  Desktop: number;
  Mobile: number;
}

interface DashboardChartProps {
  data: ChartDataPoint[];
}

export default function DashboardChart({ data }: DashboardChartProps) {
  return (
    <div className="w-full h-80 bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 shadow-lg relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">Tren Pengunjung</h3>
          <p className="text-xs text-zinc-500 mt-1">Perbandingan traffic mingguan desktop vs mobile</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shadow-sm shadow-teal-500/30" />
            <span className="text-zinc-400">Desktop</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/30" />
            <span className="text-zinc-400">Mobile</span>
          </div>
        </div>
      </div>

      <div className="w-full h-60">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
          >
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
              dy={10}
            />
            <YAxis
              stroke="#71717a"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#09090b",
                borderColor: "#27272a",
                borderRadius: "10px",
                color: "#f4f4f5",
                fontSize: "12px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
              }}
              itemStyle={{ padding: "2px 0" }}
              labelStyle={{ fontWeight: 600, color: "#a1a1aa", marginBottom: "4px" }}
            />
            <Area
              type="monotone"
              dataKey="Desktop"
              stroke="#14b8a6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorDesktop)"
            />
            <Area
              type="monotone"
              dataKey="Mobile"
              stroke="#6366f1"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorMobile)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
