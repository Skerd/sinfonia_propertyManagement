import {useMemo} from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import type {RoiProjectSummary} from "armonia/src/modules/propertyManagement/api/realEstate/private/roi/roi.response.type.ts";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";

type RoiSummaryChartsProps = {
    summary: RoiProjectSummary;
    resolveLanguageKey: ResolveLanguageKey;
};

const STATUS_COLORS = {
    sold: "hsl(142 71% 45%)",
    available: "hsl(199 89% 48%)",
    rented: "hsl(271 81% 56%)",
    other: "hsl(220 9% 46%)",
};

function formatMoney(value: number, symbol?: string): string {
    const formatted = value.toLocaleString(undefined, {maximumFractionDigits: 0});
    return symbol ? `${formatted} ${symbol}` : formatted;
}

function ChartTooltip({
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
        <div className="rounded-lg border bg-card px-3 py-2 text-sm shadow-md">
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
        <div className="rounded-lg border bg-card px-3 py-2 text-sm shadow-md">
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
            fill: "hsl(142 71% 45%)",
        },
        {
            name: rk("projectSummary.totalCosts"),
            value: Math.max(0, summary.totalCosts),
            fill: "hsl(0 84% 60%)",
        },
        {
            name: rk("projectSummary.netProfit"),
            value: summary.netProfit,
            fill: summary.netProfit >= 0 ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)",
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
            <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground">{rk("charts.financialTitle")}</h3>
                <div className="h-56 overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%">
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
                            <Tooltip content={<ChartTooltip currencySymbol={currency} />} cursor={{fill: "var(--muted)", fillOpacity: 0.4}} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {financialData.map((entry) => (
                                    <Cell key={entry.name} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground">{rk("charts.unitsByStatusTitle")}</h3>
                <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={44}
                                outerRadius={64}
                                paddingAngle={3}
                                dataKey="value"
                                strokeWidth={0}
                            >
                                {statusData.map((entry) => (
                                    <Cell key={entry.name} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<StatusTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
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
                    <span className={summary.roiPercent >= 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                        {summary.roiPercent.toFixed(1)}%
                    </span>
                </p>
            </div>
        </div>
    );
}
