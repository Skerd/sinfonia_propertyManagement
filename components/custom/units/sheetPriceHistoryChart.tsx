import {useMemo} from "react";
import {format, isValid, parseISO} from "date-fns";
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";

export type SheetPriceHistoryEntry = {
    price: number;
    currency?: {
        symbol?: string;
        abbreviation?: string;
    };
    changedAt?: string;
    changedBy?: {name?: string; surname?: string};
    reason?: string;
};

export type SheetPriceHistoryChartProps = {
    entries: SheetPriceHistoryEntry[];
    resolveLanguageKey: ResolveLanguageKey;
    className?: string;
};

type ChartPoint = {
    key: string;
    label: string;
    price: number;
    changedAt?: string;
    changedBy?: string;
    reason?: string;
};

function currencyLabel(entry: SheetPriceHistoryEntry): string {
    const sym = entry.currency?.symbol?.trim();
    if (sym) return sym;
    const abbr = entry.currency?.abbreviation?.trim();
    if (abbr) return abbr;
    return "?";
}

function formatPrice(value: number, prefix: string): string {
    const formatted = Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return prefix ? `${prefix} ${formatted}` : formatted;
}

function parseChangedAt(value?: string): Date | null {
    if (!value) return null;
    const d = parseISO(value);
    return isValid(d) ? d : null;
}

function changedByLabel(changedBy?: {name?: string; surname?: string}): string | undefined {
    if (!changedBy) return undefined;
    const parts = [changedBy.name, changedBy.surname].filter((p) => typeof p === "string" && p.trim().length > 0);
    return parts.length > 0 ? parts.join(" ") : undefined;
}

function PriceHistoryTooltip({
    active,
    payload,
    currencyPrefix,
    resolveLanguageKey,
}: {
    active?: boolean;
    payload?: {payload?: ChartPoint}[];
    currencyPrefix: string;
    resolveLanguageKey: ResolveLanguageKey;
}) {
    if (!active || !payload?.length) return null;
    const point = payload[0]?.payload;
    if (!point) return null;

    return (
        <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
            <div className="font-semibold text-card-foreground">{point.label}</div>
            <div className="mt-1 text-card-foreground">{formatPrice(point.price, currencyPrefix)}</div>
            {point.changedBy ? (
                <div className="mt-1 text-muted-foreground">
                    {resolveLanguageKey("priceHistory.changedBy")}: {point.changedBy}
                </div>
            ) : null}
            {point.reason ? (
                <div className="mt-1 text-muted-foreground">
                    {resolveLanguageKey("priceHistory.reason")}: {point.reason}
                </div>
            ) : null}
        </div>
    );
}

function SingleCurrencyChart({
    currencyPrefix,
    points,
    resolveLanguageKey,
}: {
    currencyPrefix: string;
    points: ChartPoint[];
    resolveLanguageKey: ResolveLanguageKey;
}) {
    return (
        <ResponsiveContainer width="100%" height={220}>
            <LineChart data={points} margin={{top: 8, right: 8, left: 0, bottom: 0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                    dataKey="label"
                    tick={{fill: "var(--muted-foreground)", fontSize: 11}}
                    tickLine={false}
                    axisLine={{stroke: "var(--border)"}}
                    interval="preserveStartEnd"
                />
                <YAxis
                    tick={{fill: "var(--muted-foreground)", fontSize: 11}}
                    tickLine={false}
                    axisLine={{stroke: "var(--border)"}}
                    width={72}
                    tickFormatter={(value: number) => formatPrice(value, currencyPrefix)}
                />
                <Tooltip
                    content={
                        <PriceHistoryTooltip
                            currencyPrefix={currencyPrefix}
                            resolveLanguageKey={resolveLanguageKey}
                        />
                    }
                />
                <Line
                    type="monotone"
                    dataKey="price"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={{r: 3, fill: "var(--primary)", strokeWidth: 0}}
                    activeDot={{r: 5}}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

export default function SheetPriceHistoryChart({
    entries,
    resolveLanguageKey,
    className,
}: SheetPriceHistoryChartProps) {
    const series = useMemo(() => {
        const sorted = [...entries].sort((a, b) => {
            const da = parseChangedAt(a.changedAt)?.getTime() ?? 0;
            const db = parseChangedAt(b.changedAt)?.getTime() ?? 0;
            return da - db;
        });

        const grouped = new Map<string, ChartPoint[]>();
        for (const entry of sorted) {
            const prefix = currencyLabel(entry);
            const changedAt = entry.changedAt;
            const date = parseChangedAt(changedAt);
            const label = date ? format(date, "dd MMM yyyy") : changedAt ?? "—";
            const point: ChartPoint = {
                key: `${prefix}-${changedAt ?? entry.price}`,
                label,
                price: entry.price,
                changedAt,
                changedBy: changedByLabel(entry.changedBy),
                reason: entry.reason?.trim() || undefined,
            };
            const bucket = grouped.get(prefix) ?? [];
            bucket.push(point);
            grouped.set(prefix, bucket);
        }

        return Array.from(grouped.entries()).map(([prefix, points]) => ({prefix, points}));
    }, [entries]);

    if (series.length === 0) {
        return (
            <div className={cn("flex h-[220px] items-center justify-center text-muted-foreground text-sm", className)}>
                {resolveLanguageKey("priceHistory.noData")}
            </div>
        );
    }

    return (
        <div className={cn("space-y-4", className)}>
            {series.map(({prefix, points}) => (
                <div key={prefix} className="space-y-2">
                    {series.length > 1 ? (
                        <div className="text-xs font-medium text-muted-foreground">
                            {resolveLanguageKey("priceHistory.currencySeries")}: {prefix}
                        </div>
                    ) : null}
                    <SingleCurrencyChart
                        currencyPrefix={prefix}
                        points={points}
                        resolveLanguageKey={resolveLanguageKey}
                    />
                </div>
            ))}
        </div>
    );
}
