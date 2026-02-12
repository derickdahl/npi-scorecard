"use client";

import { cn, formatResponseTime } from "@/lib/utils";
import { MessageSquare, Clock, CheckCircle2, TrendingUp, AlertCircle } from "lucide-react";

interface MetricsCardsProps {
  totalMessages: number;
  pendingMessages: number;
  respondedMessages: number;
  respondedToday: number;
  readToday?: number; // In progress (counts as 0.5)
  avgResponseTime: number;
  responseRate: number;
}

export function MetricsCards({
  totalMessages,
  pendingMessages,
  respondedMessages,
  respondedToday,
  readToday = 0,
  avgResponseTime,
  responseRate,
}: MetricsCardsProps) {
  // Calculate combined score (done = 1, read = 0.5)
  const todayScore = respondedToday + (readToday * 0.5);
  const hasPartialScore = readToday > 0;
  
  const metrics = [
    {
      label: "Total",
      value: totalMessages.toString(),
      icon: MessageSquare,
      color: "text-[var(--sonance-blue)]",
      bgColor: "bg-[var(--sonance-blue)]/10",
    },
    {
      label: "Pending",
      value: pendingMessages.toString(),
      icon: AlertCircle,
      color: pendingMessages > 5 ? "text-amber-500" : "text-emerald-500",
      bgColor: pendingMessages > 5 ? "bg-amber-500/10" : "bg-emerald-500/10",
    },
    {
      label: "Today",
      value: hasPartialScore ? todayScore.toFixed(1) : respondedToday.toString(),
      subtext: hasPartialScore ? `${respondedToday}✓ + ${readToday}◐` : undefined,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Avg Time",
      value: formatResponseTime(avgResponseTime),
      icon: Clock,
      color: avgResponseTime <= 30 ? "text-emerald-500" : avgResponseTime <= 120 ? "text-amber-500" : "text-red-500",
      bgColor: avgResponseTime <= 30 ? "bg-emerald-500/10" : avgResponseTime <= 120 ? "bg-amber-500/10" : "bg-red-500/10",
    },
    {
      label: "Rate",
      value: `${Math.round(responseRate)}%`,
      icon: TrendingUp,
      color: responseRate >= 90 ? "text-emerald-500" : responseRate >= 70 ? "text-amber-500" : "text-red-500",
      bgColor: responseRate >= 90 ? "bg-emerald-500/10" : responseRate >= 70 ? "bg-amber-500/10" : "bg-red-500/10",
    },
  ];

  return (
    <>
      {/* Mobile: 2-column grid (no horizontal scroll) */}
      <div className="md:hidden">
        <div className="grid grid-cols-2 gap-2">
          {metrics.map((metric) => (
            <div 
              key={metric.label} 
              className="bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-lg p-2.5"
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className={cn("p-1 rounded", metric.bgColor)}>
                  <metric.icon className={cn("w-3 h-3", metric.color)} />
                </div>
                <span className="text-[9px] text-[var(--foreground-muted)] uppercase tracking-wide">{metric.label}</span>
              </div>
              <p className={cn("text-lg font-bold", metric.color)}>{metric.value}</p>
              {'subtext' in metric && metric.subtext && (
                <p className="text-[8px] text-[var(--foreground-muted)]">{metric.subtext}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: Grid layout */}
      <div className="hidden md:grid grid-cols-5 gap-4">
        {metrics.map((metric) => (
          <div 
            key={metric.label} 
            className="bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", metric.bgColor)}>
                <metric.icon className={cn("w-5 h-5", metric.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[var(--foreground-muted)]">{metric.label}</p>
                <p className={cn("text-2xl font-semibold", metric.color)}>{metric.value}</p>
                {'subtext' in metric && metric.subtext && (
                  <p className="text-[10px] text-[var(--foreground-muted)]">{metric.subtext}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
