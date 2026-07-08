import React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatMonth(monthStr: string): string {
  if (!monthStr) return '';
  const [y, m] = monthStr.split('-').map(Number);
  const name = MONTH_NAMES[(m ?? 1) - 1] ?? '';
  return name ? `${name} ${y}` : monthStr;
}

export type PeriodDatum = { month: string; totalRevenue?: number; count?: number };

export type OverviewProps = {
  revenueByPeriod: PeriodDatum[];
  /** Optional label for empty state (i18n). */
  noDataLabel?: string;
};

export const Overview: React.FC<OverviewProps> = ({ revenueByPeriod, noDataLabel }) => {
  const data = revenueByPeriod.map((d) => ({
    name: formatMonth(d.month),
    total: d.totalRevenue ?? 0,
  }));

  if (data.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center text-muted-foreground text-xs">
        {noDataLabel}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
