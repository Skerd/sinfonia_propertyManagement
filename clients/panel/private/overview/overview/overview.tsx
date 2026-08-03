import React from 'react';
import { Bar, BarChart, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@coreModule/components/ui/chart.tsx';

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

const OVERVIEW_CONFIG = {
  total: { label: 'Revenue', color: 'var(--chart-1)' },
} satisfies ChartConfig;

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
    <ChartContainer config={OVERVIEW_CONFIG} className="aspect-auto h-[260px] w-full">
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <ChartTooltip cursor={{ fill: 'var(--muted)', fillOpacity: 0.6 }} content={<ChartTooltipContent />} />
        <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
};
