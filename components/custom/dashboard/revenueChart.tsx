import { compose } from 'redux';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import type { DashboardSummary } from 'armonia/src/modules/propertyManagement/api/realEstate/private/dashboard/dashboard.form.response.type.ts';
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@coreModule/components/ui/chart.tsx";
import { chartTooltipValueFormatter } from "@coreModule/components/custom/chartTooltipFormatter.tsx";
import { formatCurrency } from "@coreModule/helpers/general";
import { DashboardWidgetCard } from '@propertyManagementModule/components/custom/cards/DashboardWidgetCard.tsx';

/** Data props for the revenue chart (from API/summary). */
export interface RevenueChartDataProps {
  soldValue: number;
  reservedValue: number;
  availableValue: number;
  blockedValue: number;
  collectedAmount: number;
  totalExpenses: number;
}

export interface RevenueChartProps extends RevenueChartDataProps, WithLanguageType {}

/** Derive chart props from dashboard API summary. */
export function dashboardSummaryToRevenueChart(summary: DashboardSummary | null | undefined): RevenueChartDataProps {
  if (summary == null) {
    return {
      soldValue: 0,
      reservedValue: 0,
      availableValue: 0,
      blockedValue: 0,
      collectedAmount: 0,
      totalExpenses: 0,
    };
  }
  const collectedAmount =
    summary.totalRevenue?.reduce((acc, r) => acc + (r?.value ?? 0), 0) ?? 0;
  const units = summary.unitsByStatus;
  const soldCount = units?.sold ?? 0;
  const avgPrice = summary.averageSalePrice ?? 0;
  const inventoryValue = summary.inventoryValue ?? 0;
  const availableCount = units?.available ?? 0;
  const reservedCount = units?.reserved ?? 0;
  const availablePlusReserved = availableCount + reservedCount;

  const soldValue = soldCount * avgPrice;
  const availableValue =
    availablePlusReserved > 0
      ? (inventoryValue * availableCount) / availablePlusReserved
      : 0;
  const reservedValue =
    availablePlusReserved > 0
      ? (inventoryValue * reservedCount) / availablePlusReserved
      : 0;
  const blockedValue = 0; // not in API
  const totalExpenses = 0; // not in API

  return {
    soldValue,
    reservedValue,
    availableValue,
    blockedValue,
    collectedAmount,
    totalExpenses,
  };
}

/**
 * Compact currency through `Intl` rather than a hand-rolled divide-and-suffix:
 * the previous version emitted `1.6M €` regardless of locale while the axis on
 * the neighbouring chart emitted `$1600000`.
 */
function formatChartValue(value: number): string {
  return formatCurrency(value, "EUR", {compact: true});
}

function RevenueChartInner({
  soldValue,
  reservedValue,
  availableValue,
  blockedValue,
  collectedAmount,
  totalExpenses,
  resolveLanguageKey,
}: RevenueChartProps) {
  const unsoldValue = availableValue + blockedValue;

  /** Keys mirror the `Bar` dataKeys so the tooltip resolves label and color from here. */
  const chartConfig = {
    collected: { label: resolveLanguageKey('collected'), color: 'var(--success)' },
    pendingSales: {
      label: resolveLanguageKey('pendingSales'),
      color: 'color-mix(in oklch, var(--status-sold) 50%, transparent)',
    },
    pendingReservations: {
      label: resolveLanguageKey('pendingReservations'),
      color: 'color-mix(in oklch, var(--status-reserved) 50%, transparent)',
    },
    availableValue: { label: resolveLanguageKey('availableValue'), color: 'var(--status-available)' },
    blockedValue: { label: resolveLanguageKey('blockedValue'), color: 'var(--status-blocked)' },
    reservedValue: { label: resolveLanguageKey('reservedValue'), color: 'var(--status-reserved)' },
    soldValue: { label: resolveLanguageKey('soldValue'), color: 'var(--status-sold)' },
    totalExpenses: { label: resolveLanguageKey('totalExpenses'), color: 'var(--destructive)' },
  } satisfies ChartConfig;

  const data = [
    {
      name: resolveLanguageKey('revenue'),
      collected: collectedAmount,
      pendingSales: Math.max(0, soldValue - collectedAmount),
      pendingReservations: reservedValue * 0.7,
    },
    {
      name: resolveLanguageKey('inventory'),
      availableValue,
      blockedValue,
      reservedValue,
      soldValue,
    },
    {
      name: resolveLanguageKey('expenses'),
      totalExpenses,
    },
  ];

  return (
    <DashboardWidgetCard title={resolveLanguageKey('title')} contentClassName="pt-0">
      <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
        <BarChart data={data} layout="vertical" barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={formatChartValue}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--border)' }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: 'var(--foreground)', fontSize: 13 }}
            axisLine={{ stroke: 'var(--border)' }}
            width={100}
          />
          <ChartTooltip
            cursor={{ fill: 'var(--muted)', fillOpacity: 0.75 }}
            content={
              <ChartTooltipContent
                formatter={chartTooltipValueFormatter(chartConfig, formatChartValue)}
              />
            }
          />
          <Bar dataKey="collected" stackId="a" fill="var(--color-collected)" radius={[0, 4, 4, 0]} />
          <Bar dataKey="pendingSales" stackId="a" fill="var(--color-pendingSales)" radius={[0, 4, 4, 0]} />
          <Bar dataKey="pendingReservations" stackId="a" fill="var(--color-pendingReservations)" radius={[0, 4, 4, 0]} />
          <Bar dataKey="availableValue" stackId="b" fill="var(--color-availableValue)" radius={[0, 4, 4, 0]} />
          <Bar dataKey="blockedValue" stackId="b" fill="var(--color-blockedValue)" radius={[0, 4, 4, 0]} />
          <Bar dataKey="reservedValue" stackId="b" fill="var(--color-reservedValue)" radius={[0, 4, 4, 0]} />
          <Bar dataKey="soldValue" stackId="b" fill="var(--color-soldValue)" radius={[0, 4, 4, 0]} />
          <Bar dataKey="totalExpenses" fill="var(--color-totalExpenses)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ChartContainer>

      <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(min(8rem,100%),1fr))] gap-4 border-t border-border pt-4">
        <div className="text-center">
          <p className="font-display text-2xl font-bold tabular-nums text-success">
            {formatChartValue(collectedAmount)}
          </p>
          <p className="text-sm text-muted-foreground">{resolveLanguageKey('collected')}</p>
        </div>
        <div className="text-center">
          <p className="font-display text-2xl font-bold tabular-nums text-status-reserved">
            {formatChartValue(soldValue + reservedValue - collectedAmount)}
          </p>
          <p className="text-sm text-muted-foreground">{resolveLanguageKey('pending')}</p>
        </div>
        <div className="text-center">
          <p className="font-display text-2xl font-bold tabular-nums text-status-available">
            {formatChartValue(unsoldValue)}
          </p>
          <p className="text-sm text-muted-foreground">{resolveLanguageKey('unsold')}</p>
        </div>
        <div className="text-center">
          <p className="font-display text-2xl font-bold tabular-nums text-destructive">
            {formatChartValue(totalExpenses)}
          </p>
          <p className="text-sm text-muted-foreground">{resolveLanguageKey('expenses')}</p>
        </div>
      </div>
    </DashboardWidgetCard>
  );
}

export const RevenueChart = compose(
  withLanguage("src/modules/propertyManagement/components/custom/dashboard/revenueChart.tsx")
)(RevenueChartInner);
