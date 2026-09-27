'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, IndianRupee, Calendar, BarChart3, Layers } from 'lucide-react';

interface ChartDataItem {
  label: string;
  revenue: number;
  orderCount: number;
}

interface RevenueAnalyticsChartProps {
  chartData: ChartDataItem[];
  totalDeliveredRevenue: number;
  totalDeliveredCount: number;
  growthPercentage: number;
}

export default function RevenueAnalyticsChart({
  chartData,
  totalDeliveredRevenue,
  totalDeliveredCount,
  growthPercentage,
}: RevenueAnalyticsChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      {/* CHART HEADER & SUMMARY BADGES */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#0F2C59]" /> Visual Revenue & Sales Trend Analytics
            </h2>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
              Delivered Orders Only
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical sales breakdown over filtered duration with growth trend indicator
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* GROWTH PERCENTAGE TREND BADGE */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-extrabold ${
              growthPercentage >= 0
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            {growthPercentage >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span>
              {growthPercentage >= 0 ? `+${growthPercentage}%` : `${growthPercentage}%`} Trend
            </span>
          </div>

          <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Total Period Revenue</span>
            <span className="font-extrabold text-[#0F2C59] text-sm">
              ₹{totalDeliveredRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* GRAPH BARS DISPLAY */}
      {chartData.length > 0 ? (
        <div className="space-y-4">
          <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-8 pb-2 px-2 bg-slate-50/50 rounded-xl border border-slate-100 relative">
            {/* GRID BACKGROUND LINES */}
            <div className="absolute inset-x-0 top-1/4 border-b border-dashed border-slate-200 pointer-events-none" />
            <div className="absolute inset-x-0 top-2/4 border-b border-dashed border-slate-200 pointer-events-none" />
            <div className="absolute inset-x-0 top-3/4 border-b border-dashed border-slate-200 pointer-events-none" />

            {chartData.map((item, idx) => {
              const heightPercent = Math.max(Math.round((item.revenue / maxRevenue) * 100), 6);
              const isHovered = hoveredIndex === idx;

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center h-full justify-end relative group z-10"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* HOVER TOOLTIP */}
                  {isHovered && (
                    <div className="absolute -top-12 z-30 bg-slate-900 text-white text-[11px] p-2 rounded-lg shadow-xl font-bold whitespace-nowrap animate-fade-in border border-slate-700">
                      <div>{item.label}</div>
                      <div className="text-amber-400">₹{item.revenue.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-slate-300 font-normal">{item.orderCount} order(s)</div>
                    </div>
                  )}

                  {/* VALUE DISPLAY ON TOP */}
                  <span className="text-[10px] font-bold text-slate-600 mb-1 opacity-80 group-hover:opacity-100 hidden sm:block">
                    ₹{item.revenue >= 1000 ? `${(item.revenue / 1000).toFixed(1)}k` : item.revenue}
                  </span>

                  {/* BAR */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[48px] rounded-t-lg transition-all duration-300 ${
                      isHovered
                        ? 'bg-amber-500 shadow-md ring-2 ring-amber-300'
                        : 'bg-[#0F2C59] hover:bg-blue-800'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* X-AXIS LABELS */}
          <div className="flex justify-between gap-2 text-[11px] font-bold text-slate-600 px-2 overflow-x-auto">
            {chartData.map((item, idx) => (
              <span key={idx} className="flex-1 text-center truncate">
                {item.label}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-48 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <Layers className="h-8 w-8 mb-2 text-slate-300" />
          <p className="font-bold text-slate-600">No DELIVERED sales data available for graph plotting.</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Select a date range with delivered orders to view analytics.</p>
        </div>
      )}
    </div>
  );
}
