import { Area, AreaChart, Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatMonth(monthStr: string): string {
  if (!monthStr) return '';
  const parts = monthStr.split('-').map(Number);
  const y = parts[0];
  const m = parts[1] ?? 1;
  const name = MONTH_NAMES[m - 1] ?? '';
  return name ? `${name} ${y}` : monthStr;
}

type PeriodDatum = { month: string; count?: number; totalRevenue?: number };

type AnalyticsChartProps = {
  salesByPeriod: PeriodDatum[];
  noDataLabel?: string;
};

export function AnalyticsChart({ salesByPeriod, noDataLabel }: AnalyticsChartProps) {
  const data = salesByPeriod.map((d) => ({
    name: formatMonth(d.month),
    count: d.count ?? 0,
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
      <AreaChart data={data}>
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
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="currentColor"
          className="text-primary"
          fill="currentColor"
          fillOpacity={0.15}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

type RevenueChartProps = {
  revenueByPeriod: PeriodDatum[];
  noDataLabel?: string;
};

export function RevenueChart({ revenueByPeriod, noDataLabel }: RevenueChartProps) {
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
}

type SalesByPaymentType = { cash: number; payment_plan: number };

type PaymentTypeChartProps = {
  salesByPaymentType: SalesByPaymentType;
  noDataLabel?: string;
};

export function PaymentTypeChart({ salesByPaymentType, noDataLabel }: PaymentTypeChartProps) {
  const data = [
    { name: 'Cash', value: salesByPaymentType?.cash ?? 0, fill: 'hsl(var(--chart-1))' },
    { name: 'Payment plan', value: salesByPaymentType?.payment_plan ?? 0, fill: 'hsl(var(--chart-2))' },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex h-[160px] items-center justify-center text-muted-foreground text-xs">
        {noDataLabel}
      </div>
    );
  }

  const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))'];
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 24 }}>
        <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="name" width={100} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
