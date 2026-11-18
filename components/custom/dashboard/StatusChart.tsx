import { useMemo } from 'react';
import { compose } from 'redux';
import { PieChart, Pie, Cell } from 'recharts';
import type { UnitsByStatus } from 'armonia/src/modules/propertyManagement/api/realEstate/private/dashboard/dashboard.form.response.type.ts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@coreModule/components/ui/chart.tsx';
import { DashboardWidgetCard } from '@propertyManagementModule/components/custom/cards/DashboardWidgetCard.tsx';
import withLanguage, { type WithLanguageType } from '@coreModule/helpers/hocs/withLanguage.tsx';

export interface StatusChartData {
  available: number;
  reserved: number;
  sold: number;
  blocked: number;
  leased: number;
}

/** Map API UnitsByStatus (unavailable) to chart shape (blocked). */
export function unitsByStatusToChartData(units: UnitsByStatus): StatusChartData {
  return {
    available: units.available ?? 0,
    reserved: units.reserved ?? 0,
    sold: units.sold ?? 0,
    blocked: units.unavailable ?? 0,
    leased: units.leased ?? 0,
  };
}

/** Slice order; `blocked` is the unit status `unavailable` (see unitsByStatusToChartData). */
const STATUS_KEYS: (keyof StatusChartData)[] = ['available', 'reserved', 'sold', 'leased', 'blocked'];

export interface StatusChartProps {
  data: StatusChartData;
  title?: string;
  totalLabel?: string;
}

function StatusChartInner({ data, title, totalLabel, resolveLanguageKey }: StatusChartProps & WithLanguageType) {
  /** Keyed by status so the slice, the legend swatch and the tooltip all resolve the same label and token. */
  const chartConfig = useMemo(
    () => Object.fromEntries(
      STATUS_KEYS.map((key) => [key, { label: resolveLanguageKey(key), color: `var(--status-${key})` }]),
    ) satisfies ChartConfig,
    [resolveLanguageKey],
  );

  const chartData = STATUS_KEYS.map((key) => ({
    status: key,
    name: resolveLanguageKey(key),
    value: data[key] ?? 0,
    /** Root-level token, not the chart-scoped `--color-*`, so the legend below resolves it too. */
    color: `var(--status-${key})`,
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <DashboardWidgetCard
      title={title ?? resolveLanguageKey('title')}
      footer={
        <p className="w-full py-2 text-center text-xs text-muted-foreground">
          {totalLabel ?? resolveLanguageKey('total')}: <span className="font-semibold text-foreground">{total}</span>
        </p>
      }
    >
      <ChartContainer config={chartConfig} className="aspect-auto h-44 w-full">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey="status" hideLabel />} />
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={58}
            paddingAngle={4}
            dataKey="value"
            nameKey="status"
            strokeWidth={0}
          >
            {chartData.map((entry) => (
              <Cell key={entry.status} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>

      <div className="grid grid-cols-2 gap-2 mt-3">
        {chartData.map((item) => (
          <div key={item.status} className="flex items-center gap-2">
            <div
              className="size-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-muted-foreground">
              {item.name}: <span className="text-foreground font-medium">{item.value}</span>
            </span>
          </div>
        ))}
      </div>
    </DashboardWidgetCard>
  );
}

export const StatusChart = compose(
  withLanguage('src/modules/propertyManagement/components/custom/dashboard/StatusChart.tsx')
)(StatusChartInner);
