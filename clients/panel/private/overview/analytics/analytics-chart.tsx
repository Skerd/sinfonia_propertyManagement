import { Area, AreaChart, Bar, BarChart, Cell, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@coreModule/components/ui/chart.tsx';

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

const SALES_CONFIG = {
  count: { label: 'Sales', color: 'var(--chart-1)' },
} satisfies ChartConfig;

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
    <ChartContainer config={SALES_CONFIG} className="aspect-auto h-[260px] w-full">
      <AreaChart data={data}>
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
        />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <Area
          type="monotone"
          dataKey="count"
          stroke="var(--color-count)"
          fill="var(--color-count)"
          fillOpacity={0.15}
        />
      </AreaChart>
    </ChartContainer>
  );
}

type RevenueChartProps = {
  revenueByPeriod: PeriodDatum[];
  noDataLabel?: string;
};

const REVENUE_CONFIG = {
  total: { label: 'Revenue', color: 'var(--chart-1)' },
} satisfies ChartConfig;

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
    <ChartContainer config={REVENUE_CONFIG} className="aspect-auto h-[260px] w-full">
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
}

type SalesByPaymentType = { cash: number; payment_plan: number };

type PaymentTypeChartProps = {
  salesByPaymentType: SalesByPaymentType;
  noDataLabel?: string;
};

const PAYMENT_TYPE_CONFIG = {
  cash: { label: 'Cash', color: 'var(--chart-1)' },
  payment_plan: { label: 'Payment plan', color: 'var(--chart-2)' },
} satisfies ChartConfig;

export function PaymentTypeChart({ salesByPaymentType, noDataLabel }: PaymentTypeChartProps) {
  const data = (Object.keys(PAYMENT_TYPE_CONFIG) as (keyof SalesByPaymentType)[])
    .map((key) => ({
      key,
      name: String(PAYMENT_TYPE_CONFIG[key].label),
      value: salesByPaymentType?.[key] ?? 0,
    }))
    .filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex h-[160px] items-center justify-center text-muted-foreground text-xs">
        {noDataLabel}
      </div>
    );
  }

  return (
    <ChartContainer config={PAYMENT_TYPE_CONFIG} className="aspect-auto h-[160px] w-full">
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 24 }}>
        <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="name" width={100} stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
        <ChartTooltip
          cursor={{ fill: 'var(--muted)', fillOpacity: 0.6 }}
          content={<ChartTooltipContent nameKey="key" hideLabel />}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((entry) => (
            <Cell key={entry.key} fill={`var(--color-${entry.key})`} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
