"use client";

import { SourceMetrics, MessageSource, SOURCE_CONFIG } from "@/lib/supabase";
import { cn, formatResponseTime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SourceIcon, getSourceLabel } from "./source-icon";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

interface ResponseChartProps {
  metrics: SourceMetrics[];
}

export function ResponseTimeChart({ metrics }: ResponseChartProps) {
  const chartData = metrics.map((m) => ({
    source: getSourceLabel(m.source),
    fullSource: m.source,
    avgTime: Math.round(m.avg_response_time_minutes),
    color: SOURCE_CONFIG[m.source].color,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Average Response Time by Source</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
              <XAxis
                type="number"
                tickFormatter={(value) => formatResponseTime(value)}
                tick={{ fontSize: 10, fill: "var(--foreground-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="source"
                tick={{ fontSize: 11, fill: "var(--foreground-secondary)" }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-2 shadow-lg">
                        <p className="text-xs font-medium text-[var(--foreground)]">{data.source}</p>
                        <p className="text-xs text-[var(--foreground-muted)]">
                          Avg: {formatResponseTime(data.avgTime)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="avgTime" radius={[0, 4, 4, 0]} barSize={20}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function MessageVolumeChart({ metrics }: ResponseChartProps) {
  const chartData = metrics.map((m) => ({
    name: getSourceLabel(m.source),
    value: m.total_received,
    color: SOURCE_CONFIG[m.source].color,
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Message Volume by Source</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] flex items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const percentage = ((data.value / total) * 100).toFixed(1);
                    return (
                      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-2 shadow-lg">
                        <p className="text-xs font-medium text-[var(--foreground)]">{data.name}</p>
                        <p className="text-xs text-[var(--foreground-muted)]">
                          {data.value} messages ({percentage}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 ml-4">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-[var(--foreground-secondary)]">{item.name}</span>
                <span className="text-xs font-medium text-[var(--foreground)]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SourceMetricsTable({ metrics }: ResponseChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Response Metrics by Source</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2 px-2 text-xs font-medium text-[var(--foreground-muted)]">Source</th>
                <th className="text-right py-2 px-2 text-xs font-medium text-[var(--foreground-muted)]">Received</th>
                <th className="text-right py-2 px-2 text-xs font-medium text-[var(--foreground-muted)]">Responded</th>
                <th className="text-right py-2 px-2 text-xs font-medium text-[var(--foreground-muted)]">Pending</th>
                <th className="text-right py-2 px-2 text-xs font-medium text-[var(--foreground-muted)]">Avg Time</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m) => {
                const responseRate = m.total_received > 0 ? (m.total_responded / m.total_received) * 100 : 0;
                return (
                  <tr key={m.source} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        <SourceIcon source={m.source} size={16} style={{ color: SOURCE_CONFIG[m.source].color }} />
                        <span className="text-[var(--foreground)]">{getSourceLabel(m.source)}</span>
                      </div>
                    </td>
                    <td className="text-right py-2 px-2 text-[var(--foreground-secondary)]">{m.total_received}</td>
                    <td className="text-right py-2 px-2 text-emerald-600">{m.total_responded}</td>
                    <td className="text-right py-2 px-2">
                      <span className={cn(
                        m.pending_count > 0 ? "text-amber-600" : "text-[var(--foreground-muted)]"
                      )}>
                        {m.pending_count}
                      </span>
                    </td>
                    <td className="text-right py-2 px-2">
                      <span className={cn(
                        m.avg_response_time_minutes <= 30
                          ? "text-emerald-600"
                          : m.avg_response_time_minutes <= 120
                          ? "text-amber-600"
                          : "text-red-600"
                      )}>
                        {formatResponseTime(m.avg_response_time_minutes)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
