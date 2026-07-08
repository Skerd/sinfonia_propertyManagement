import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { UnitsByStatus } from 'armonia/src/modules/propertyManagement/api/realEstate/private/dashboard/dashboard.form.response.type.ts';
import { DashboardWidgetCard } from '@propertyManagementModule/components/custom/cards/DashboardWidgetCard.tsx';

export interface StatusChartData {
  available: number;
  reserved: number;
  sold: number;
  blocked: number;
}

/** Map API UnitsByStatus (unavailable) to chart shape (blocked). */
export function unitsByStatusToChartData(units: UnitsByStatus): StatusChartData {
  return {
    available: units.available ?? 0,
    reserved: units.reserved ?? 0,
    sold: units.sold ?? 0,
    blocked: units.unavailable ?? 0,
  };
}

const COLORS = {
  available: 'hsl(199 89% 48%)',
  reserved: 'hsl(38 92% 50%)',
  sold: 'hsl(142 71% 45%)',
  blocked: 'hsl(0 84% 60%)',
};

const LABELS: Record<keyof StatusChartData, string> = {
  available: 'Të Lira',
  reserved: 'Të Rezervuara',
  sold: 'Të Shitura',
  blocked: 'Të Bllokuara',
};

export interface StatusChartProps {
  data: StatusChartData;
  title?: string;
  totalLabel?: string;
}

export function StatusChart({ data, title = 'Statusi i Njësive', totalLabel = 'Totali' }: StatusChartProps) {
  const chartData = (Object.keys(LABELS) as (keyof StatusChartData)[]).map((key) => ({
    name: LABELS[key],
    value: data[key] ?? 0,
    color: COLORS[key],
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
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={58}
              paddingAngle={4}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '0.75rem',
                color: 'var(--card-foreground)',
              }}
              itemStyle={{ color: 'var(--card-foreground)' }}
              labelStyle={{ color: 'var(--card-foreground)' }}
              formatter={(value: number, name: string) => [`${value}`, name ?? '']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

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
