import { PieChart, Pie, Cell } from 'recharts';
import type { UnitsByStatus } from 'armonia/src/modules/propertyManagement/api/realEstate/private/dashboard/dashboard.form.response.type.ts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@coreModule/components/ui/chart.tsx';
import { DashboardWidgetCard } from '@propertyManagementModule/components/custom/cards/DashboardWidgetCard.tsx';

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

const LABELS: Record<keyof StatusChartData, string> = {
  available: 'Të Lira',
  reserved: 'Të Rezervuara',
  sold: 'Të Shitura',
  leased: 'Me Qira',
  blocked: 'Të Bllokuara',
};

/** Keyed by status so the slice, the legend swatch and the tooltip all resolve the same token. */
const CHART_CONFIG = {
  available: { label: LABELS.available, color: 'var(--status-available)' },
  reserved: { label: LABELS.reserved, color: 'var(--status-reserved)' },
  sold: { label: LABELS.sold, color: 'var(--status-sold)' },
  leased: { label: LABELS.leased, color: 'var(--status-leased)' },
  blocked: { label: LABELS.blocked, color: 'var(--status-blocked)' },
} satisfies ChartConfig;

export interface StatusChartProps {
  data: StatusChartData;
  title?: string;
  totalLabel?: string;
}

export function StatusChart({ data, title = 'Statusi i Njësive', totalLabel = 'Totali' }: StatusChartProps) {
  const chartData = (Object.keys(LABELS) as (keyof StatusChartData)[]).map((key) => ({
    status: key,
    name: LABELS[key],
    value: data[key] ?? 0,
    /** Root-level token, not the chart-scoped `--color-*`, so the legend below resolves it too. */
    color: `var(--status-${key})`,
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <DashboardWidgetCard
      title={title}
      contentClassName="pt-0"
      footer={
        <p className="text-center text-muted-foreground text-xs py-2">
          {totalLabel}: <span className="text-foreground font-semibold">{total}</span>
        </p>
      }
    >
      <ChartContainer config={CHART_CONFIG} className="aspect-auto h-44 w-full">
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
          <div key={item.name} className="flex items-center gap-2">
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
