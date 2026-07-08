import { compose } from 'redux';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { DashboardSummary } from 'armonia/src/modules/propertyManagement/api/realEstate/private/dashboard/dashboard.form.response.type.ts';
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
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

function formatChartValue(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M €`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K €`;
  return `${value} €`;
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
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
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
            <Tooltip
              formatter={(value: number) => formatChartValue(value)}
              cursor={{ fill: 'var(--muted)', fillOpacity: 0.75 }}
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '0.75rem',
                color: 'var(--card-foreground)',
              }}
            />
            <Bar dataKey="collected" name={resolveLanguageKey('collected')} stackId="a" fill="var(--status-sold)" radius={[0, 4, 4, 0]} />
            <Bar dataKey="pendingSales" name={resolveLanguageKey('pendingSales')} stackId="a" fill="color-mix(in oklch, var(--status-sold) 50%, transparent)" radius={[0, 4, 4, 0]} />
            <Bar dataKey="pendingReservations" name={resolveLanguageKey('pendingReservations')} stackId="a" fill="color-mix(in oklch, var(--status-reserved) 50%, transparent)" radius={[0, 4, 4, 0]} />
            <Bar dataKey="availableValue" name={resolveLanguageKey('availableValue')} stackId="b" fill="var(--status-available)" radius={[0, 4, 4, 0]} />
            <Bar dataKey="blockedValue" name={resolveLanguageKey('blockedValue')} stackId="b" fill="var(--status-blocked)" radius={[0, 4, 4, 0]} />
            <Bar dataKey="reservedValue" name={resolveLanguageKey('reservedValue')} stackId="b" fill="var(--status-reserved)" radius={[0, 4, 4, 0]} />
            <Bar dataKey="soldValue" name={resolveLanguageKey('soldValue')} stackId="b" fill="var(--status-sold)" radius={[0, 4, 4, 0]} />
            <Bar dataKey="totalExpenses" name={resolveLanguageKey('totalExpenses')} fill="var(--destructive)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-status-sold text-2xl font-display font-bold">
            {formatChartValue(collectedAmount)}
          </p>
          <p className="text-muted-foreground text-sm">{resolveLanguageKey('collected')}</p>
        </div>
        <div className="text-center">
          <p className="text-status-reserved text-2xl font-display font-bold">
            {formatChartValue(soldValue + reservedValue - collectedAmount)}
          </p>
          <p className="text-muted-foreground text-sm">{resolveLanguageKey('pending')}</p>
        </div>
        <div className="text-center">
          <p className="text-status-available text-2xl font-display font-bold">
            {formatChartValue(unsoldValue)}
          </p>
          <p className="text-muted-foreground text-sm">{resolveLanguageKey('unsold')}</p>
        </div>
        <div className="text-center">
          <p className="text-destructive text-2xl font-display font-bold">
            {formatChartValue(totalExpenses)}
          </p>
          <p className="text-muted-foreground text-sm">{resolveLanguageKey('expenses')}</p>
        </div>
      </div>
    </DashboardWidgetCard>
  );
}

export const RevenueChart = compose(
  withLanguage("src/modules/propertyManagement/components/custom/dashboard/revenueChart.tsx")
)(RevenueChartInner);
