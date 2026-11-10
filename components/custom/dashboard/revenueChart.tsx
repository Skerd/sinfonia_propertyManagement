import { compose } from 'redux';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { useState } from 'react';
import type { DashboardSummary, RevenueByCurrency } from 'armonia/src/modules/propertyManagement/api/realEstate/private/dashboard/dashboard.form.response.type.ts';
import { addMoney } from 'armonia/src/modules/core/helpers/money.ts';
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@coreModule/components/ui/chart.tsx";
import {ToggleGroup, ToggleGroupItem} from "@coreModule/components/ui/toggle-group.tsx";
import {formatNumber} from "@coreModule/helpers/general/numbers.ts";
import { DashboardWidgetCard } from '@propertyManagementModule/components/custom/cards/DashboardWidgetCard.tsx';

/** One currency's figures, all read from the dashboard summary; amounts of two currencies are never added (GLB-08). */
export interface RevenueChartSeries {
  currencyId: string;
  /** The currency's symbol (or name) shown after each amount. */
  currencyLabel: string;
  /** Sale prices of the period's sales (`totalRevenue`). */
  soldValue: number;
  /** What active payment plans still owe (`paymentPlans.totalOutstanding`). */
  pendingSales: number;
  /** List price of the units still for sale, available or reserved (`inventoryValue`). */
  unsoldValue: number;
  /** Verified unit costs, paid and outstanding. */
  totalExpenses: number;
}

type SeriesField = Exclude<keyof RevenueChartSeries, 'currencyId' | 'currencyLabel'>;

export interface RevenueChartProps extends WithLanguageType {
  series: RevenueChartSeries[];
}

/** The dashboard summary as one chart series per currency that has any figure, in first-seen order. */
export function dashboardSummaryToRevenueChart(
  summary: Pick<DashboardSummary, 'totalRevenue' | 'paymentPlans' | 'inventoryValue' | 'verifiedPaidUnitCosts' | 'verifiedOutstandingUnitCosts'> | null | undefined,
): RevenueChartSeries[] {
  if (summary == null) return [];
  const byCurrency = new Map<string, RevenueChartSeries>();
  const add = (rows: RevenueByCurrency[] | undefined, field: SeriesField) => {
    for (const row of rows ?? []) {
      const entry = byCurrency.get(row.currencyId) ?? {
        currencyId: row.currencyId,
        currencyLabel: row.currencySymbol || row.currencyName || '',
        soldValue: 0,
        pendingSales: 0,
        unsoldValue: 0,
        totalExpenses: 0,
      };
      entry[field] = addMoney(entry[field], row.value);
      byCurrency.set(row.currencyId, entry);
    }
  };
  add(summary.totalRevenue, 'soldValue');
  add(summary.paymentPlans?.totalOutstanding, 'pendingSales');
  add(summary.inventoryValue, 'unsoldValue');
  add(summary.verifiedPaidUnitCosts, 'totalExpenses');
  add(summary.verifiedOutstandingUnitCosts, 'totalExpenses');
  return [...byCurrency.values()];
}

const EMPTY_SERIES: RevenueChartSeries = {currencyId: '', currencyLabel: '', soldValue: 0, pendingSales: 0, unsoldValue: 0, totalExpenses: 0};

function RevenueChartInner({ series, resolveLanguageKey }: RevenueChartProps) {
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const current = series.find((entry) => entry.currencyId === selectedId) ?? series[0] ?? EMPTY_SERIES;

  /** Compact amount followed by the series' own currency, never an assumed one. */
  const formatChartValue = (value: number): string => {
    const formatted = formatNumber(value, {compact: true});
    return current.currencyLabel ? `${formatted} ${current.currencyLabel}` : formatted;
  };

  /** Keys mirror the `Bar` dataKeys so the tooltip resolves label and color from here. */
  const chartConfig = {
    soldValue: { label: resolveLanguageKey('soldValue'), color: 'var(--status-sold)' },
    pendingSales: { label: resolveLanguageKey('pendingSales'), color: 'var(--status-reserved)' },
    unsoldValue: { label: resolveLanguageKey('unsold'), color: 'var(--status-available)' },
    totalExpenses: { label: resolveLanguageKey('totalExpenses'), color: 'var(--destructive)' },
  } satisfies ChartConfig;

  const data = [
    { name: resolveLanguageKey('revenue'), soldValue: current.soldValue },
    { name: resolveLanguageKey('pending'), pendingSales: current.pendingSales },
    { name: resolveLanguageKey('inventory'), unsoldValue: current.unsoldValue },
    { name: resolveLanguageKey('expenses'), totalExpenses: current.totalExpenses },
  ];

  const footer: {field: SeriesField; label: string; className: string}[] = [
    {field: 'soldValue', label: resolveLanguageKey('soldValue'), className: 'text-status-sold'},
    {field: 'pendingSales', label: resolveLanguageKey('pending'), className: 'text-status-reserved'},
    {field: 'unsoldValue', label: resolveLanguageKey('unsold'), className: 'text-status-available'},
    {field: 'totalExpenses', label: resolveLanguageKey('expenses'), className: 'text-destructive'},
  ];

  return (
    <DashboardWidgetCard
      title={resolveLanguageKey('title')}
      action={series.length > 1 ? (
        <ToggleGroup
          type="single"
          spacing={0}
          variant="outline"
          size="sm"
          value={current.currencyId}
          // Radix clears the value when the active item is pressed again; keep a currency selected.
          onValueChange={(next) => { if (next) setSelectedId(next); }}
          aria-label={resolveLanguageKey('currency')}
        >
          {series.map((entry) => (
            <ToggleGroupItem key={entry.currencyId} value={entry.currencyId} className="text-xs">
              {entry.currencyLabel || entry.currencyId}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      ) : undefined}
    >
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
              <ChartTooltipContent valueFormatter={formatChartValue} />
            }
          />
          <Bar dataKey="soldValue" fill="var(--color-soldValue)" radius={[0, 4, 4, 0]} />
          <Bar dataKey="pendingSales" fill="var(--color-pendingSales)" radius={[0, 4, 4, 0]} />
          <Bar dataKey="unsoldValue" fill="var(--color-unsoldValue)" radius={[0, 4, 4, 0]} />
          <Bar dataKey="totalExpenses" fill="var(--color-totalExpenses)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ChartContainer>

      <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(min(8rem,100%),1fr))] gap-4 border-t border-border pt-4">
        {footer.map(({field, label, className}) => (
          <div key={field} className="text-center">
            <p className={`font-display text-2xl font-bold tabular-nums ${className}`}>
              {formatChartValue(current[field])}
            </p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </DashboardWidgetCard>
  );
}

export const RevenueChart = compose(
  withLanguage("src/modules/propertyManagement/components/custom/dashboard/revenueChart.tsx")
)(RevenueChartInner);
