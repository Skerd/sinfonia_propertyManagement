import React from 'react';
import { Bar, BarChart, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@coreModule/components/ui/chart.tsx';
import {formatNumber} from "@coreModule/helpers/general/numbers.ts";
import type {PeriodDatum} from "armonia/src/modules/propertyManagement/api/realEstate/private/dashboard/dashboard.form.response.type.ts";
import {revenueByPeriodSeries} from "@propertyManagementModule/helpers/dashboard/revenueByPeriodSeries.ts";

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatMonth(monthStr: string): string {
  if (!monthStr) return '';
  const [y, m] = monthStr.split('-').map(Number);
  const name = MONTH_NAMES[(m ?? 1) - 1] ?? '';
  return name ? `${name} ${y}` : monthStr;
}

export type OverviewProps = {
  revenueByPeriod: PeriodDatum[];
  /** Optional label for empty state (i18n). */
  noDataLabel?: string;
};

export const Overview: React.FC<OverviewProps> = ({ revenueByPeriod, noDataLabel }) => {
  const {data, config, keys} = revenueByPeriodSeries(revenueByPeriod, formatMonth);

  if (data.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center text-muted-foreground text-xs">
        {noDataLabel}
      </div>
    );
  }

  return (
    <ChartContainer config={config} className="aspect-auto h-[260px] w-full">
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
          tickFormatter={(value: number) => formatNumber(value, {compact: true})}
        />
        <ChartTooltip cursor={{ fill: 'var(--muted)', fillOpacity: 0.6 }} content={<ChartTooltipContent />} />
        {keys.map((key) => (
          <Bar key={key} dataKey={key} fill={`var(--color-${key})`} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ChartContainer>
  );
};
