import {useMemo} from "react";
import {formatNumber} from "@coreModule/helpers/general";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    XAxis,
    YAxis,
} from "recharts";
import type {RoiProjectSummary} from "armonia/src/modules/propertyManagement/api/realEstate/private/roi/roi.response.type.ts";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {
    ChartContainer,
    ChartTooltip,
    type ChartConfig,
} from "@coreModule/components/ui/chart.tsx";

type RoiSummaryChartsProps = {
    summary: RoiProjectSummary;
    resolveLanguageKey: ResolveLanguageKey;
};

/** Unit statuses reuse the domain tokens; `rented` is the same concept as the `leased` status. */
const STATUS_COLORS = {
    sold: "var(--status-sold)",
    available: "var(--status-available)",
    rented: "var(--status-leased)",
    other: "var(--muted-foreground)",
};

const FINANCIAL_CONFIG = {
    value: {color: "var(--chart-1)"},
} satisfies ChartConfig;

const STATUS_CONFIG = {
    value: {color: "var(--chart-1)"},
} satisfies ChartConfig;

function formatMoney(value: number, symbol?: string): string {
    const formatted = formatNumber(value);
    return symbol ? `${formatted} ${symbol}` : formatted;
}

function FinancialTooltip({
    active,
    payload,
    currencySymbol,
}: {
    active?: boolean;
    payload?: {name?: string; value?: number; payload?: {fill?: string}}[];
    currencySymbol?: string;
}) {
    if (!active || !payload?.length) return null;
    const item = payload[0];
    return (
        <div className="rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
            <p className="font-medium text-card-foreground">{item.name}</p>
            <p className="text-muted-foreground">{formatMoney(item.value ?? 0, currencySymbol)}</p>
        </div>
    );
}

function StatusTooltip({
    active,
    payload,
}: {
    active?: boolean;
    payload?: {name?: string; value?: number}[];
}) {
    if (!active || !payload?.length) return null;
    const item = payload[0];
    return (
        <div className="rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
            <p className="font-medium text-card-foreground">{item.name}</p>
            <p className="text-muted-foreground">{item.value ?? 0}</p>
        </div>
    );
}

export default function RoiSummaryCharts({summary, resolveLanguageKey}: RoiSummaryChartsProps) {
    const rk = (key: string) => String(resolveLanguageKey(key));
    const currency = summary.baseCurrencySymbol;

    const financialData = useMemo(() => [
        {
            name: rk("projectSummary.totalRevenue"),
            value: Math.max(0, summary.totalRevenue),
            fill: "var(--success)",
        },
        {
            name: rk("projectSummary.totalCosts"),
            value: Math.max(0, summary.totalCosts),
            fill: "var(--destructive)",
        },
        {
            name: rk("projectSummary.netProfit"),
            value: summary.netProfit,
            fill: summary.netProfit >= 0 ? "var(--success)" : "var(--destructive)",
        },
    ], [summary, rk]);

    const statusData = useMemo(() => {
        const other = Math.max(
            0,
            summary.totalUnits - summary.soldUnits - summary.availableUnits - summary.rentedUnits,
        );
        const items = [
            {name: rk("projectSummary.sold"), value: summary.soldUnits, color: STATUS_COLORS.sold},
            {name: rk("projectSummary.available"), value: summary.availableUnits, color: STATUS_COLORS.available},
            {name: rk("projectSummary.rented"), value: summary.rentedUnits, color: STATUS_COLORS.rented},
        ];
        if (other > 0) {
            items.push({name: rk("charts.otherUnits"), value: other, color: STATUS_COLORS.other});
        }
        return items.filter((d) => d.value > 0);
    }, [summary, rk]);

    const statusTotal = statusData.reduce((s, d) => s + d.value, 0);

    const yMax = Math.max(...financialData.map((d) => d.value), 0);
    const yMin = Math.min(...financialData.map((d) => d.value), 0);
    const yDomain: [number, number] = [
        yMin < 0 ? yMin * 1.12 : 0,
        yMax > 0 ? yMax * 1.12 : 1,
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex flex-col border rounded-lg p-4 gap-y-3">
                <h3 className="font-medium text-sm text-muted-foreground">{rk("charts.financialTitle")}</h3>
                <ChartContainer config={FINANCIAL_CONFIG} className="aspect-auto h-56 w-full overflow-hidden">
                    <BarChart data={financialData} margin={{top: 12, right: 12, left: 4, bottom: 8}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis
                            dataKey="name"
                            tick={{fill: "var(--muted-foreground)", fontSize: 11}}
                            axisLine={{stroke: "var(--border)"}}
                            interval={0}
                            tickFormatter={(v: string) => v.length > 12 ? `${v.slice(0, 11)}…` : v}
                        />
                        <YAxis
                            domain={yDomain}
                            tick={{fill: "var(--muted-foreground)", fontSize: 11}}
                            axisLine={{stroke: "var(--border)"}}
                            tickFormatter={(v: number) => formatMoney(v, currency)}
                            width={72}
                        />
                        <ChartTooltip content={<FinancialTooltip currencySymbol={currency} />} cursor={{fill: "var(--muted)", fillOpacity: 0.4}} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {financialData.map((entry) => (
                                <Cell key={entry.name} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </div>

            <div className="flex flex-col border rounded-lg p-4 gap-y-3">
                <h3 className="font-medium text-sm text-muted-foreground">{rk("charts.unitsByStatusTitle")}</h3>
                <ChartContainer config={STATUS_CONFIG} className="aspect-auto h-44 w-full">
                    <PieChart>
                        <ChartTooltip content={<StatusTooltip />} />
                        <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={44}
                            outerRadius={64}
                            paddingAngle={3}
                            dataKey="value"
                            nameKey="name"
                            strokeWidth={0}
                        >
                            {statusData.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ChartContainer>
                <div className="grid grid-cols-2 gap-2">
                    {statusData.map((item) => (
                        <div key={item.name} className="flex items-center gap-2 text-xs">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{backgroundColor: item.color}} />
                            <span className="text-muted-foreground truncate">
                                {item.name}: <span className="text-foreground font-medium">{item.value}</span>
                            </span>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-center text-muted-foreground border-t pt-2">
                    {rk("charts.totalUnits")}: <span className="text-foreground font-semibold">{statusTotal}</span>
                    {" · "}
                    {rk("projectSummary.roi")}:{" "}
                    <span className={summary.roiPercent >= 0 ? "text-success font-semibold" : "text-destructive font-semibold"}>
                        {summary.roiPercent.toFixed(1)}%
                    </span>
                </p>
            </div>
        </div>
    );
}
