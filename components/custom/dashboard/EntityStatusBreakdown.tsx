import {Badge} from "@coreModule/components/ui/badge.tsx";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {EntityStatusStats, UnitsByStatusCounts} from "@propertyManagementModule/components/custom/dashboard/entityStatus.types.ts";
import {formatCompactCurrency} from "@propertyManagementModule/components/custom/dashboard/entityStatus.types.ts";

type ResolveLabel = (key: string) => string;

/*
 * Hoisted: both tables are constants, and these components render once per row in card lists.
 * Rebuilding them in the component body allocated five objects (and five long class strings)
 * per card per render.
 */
const BADGE_ROW_ITEMS: {
    key: keyof UnitsByStatusCounts;
    labelKey: string;
    descKey: string;
    className: string;
}[] = [
    {
        key: "available",
        labelKey: "statistics.available",
        descKey: "statistics.availableDesc",
        className: "border-status-available/30 bg-status-available/10 text-status-available",
    },
    {
        key: "reserved",
        labelKey: "statistics.reserved",
        descKey: "statistics.reservedDesc",
        className: "border-status-reserved/30 bg-status-reserved/10 text-status-reserved",
    },
    {
        key: "sold",
        labelKey: "statistics.sold",
        descKey: "statistics.soldDesc",
        className: "border-status-sold/30 bg-status-sold/10 text-status-sold",
    },
    {
        key: "leased",
        labelKey: "statistics.leased",
        descKey: "statistics.leasedDesc",
        className: "border-primary/30 bg-primary/10 text-primary",
    },
    {
        key: "unavailable",
        labelKey: "statistics.unavailable",
        descKey: "statistics.unavailableDesc",
        className: "border-status-blocked/30 bg-status-blocked/10 text-status-blocked",
    },
];

/** `[background, text]` — kept as a tuple so the render does not split a packed class string. */
const BREAKDOWN_TONES = {
    sold: ["bg-status-sold/10", "text-status-sold"],
    reserved: ["bg-status-reserved/10", "text-status-reserved"],
    available: ["bg-status-available/10", "text-status-available"],
    leased: ["bg-primary/10", "text-primary"],
    blocked: ["bg-status-blocked/10", "text-status-blocked"],
} as const;

/** Compact badge row for list entity cards. */
export function EntityStatusBadgeRow({
    unitsByStatus,
    resolveLanguageKey,
}: {
    unitsByStatus: UnitsByStatusCounts | undefined;
    resolveLanguageKey: ResolveLabel;
}) {
    if (!unitsByStatus || !Object.values(unitsByStatus).some((v) => (v ?? 0) > 0)) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-1 pt-0.5">
            {BADGE_ROW_ITEMS.map(({key, labelKey, descKey, className}) => {
                const count = unitsByStatus[key] ?? 0;
                if (count <= 0) return null;
                return (
                    <TooltipDisplayer key={key} tooltip={resolveLanguageKey(descKey)}>
                        <Badge variant="outline" className={cn("text-xs font-medium", className)}>
                            {count} {resolveLanguageKey(labelKey)}
                        </Badge>
                    </TooltipDisplayer>
                );
            })}
        </div>
    );
}

/*
 * Label keys were props with these defaults, but no call site ever overrode them (nor the
 * `unitsByStatus` / `totalUnits` fallback, `showSoldPercentage`, or `className`): ten of sixteen
 * props were dead. Callers build `stats` with `unitsByStatusToEntityStats` and pass it directly.
 */
const LABEL_KEYS = {
    sold: "sold",
    reserved: "reservedShort",
    available: "availableShort",
    blocked: "blockedShort",
    leased: "leasedShort",
    value: "value",
    collected: "collected",
} as const;

/** Full dashboard breakdown: progress bar, grid, optional footer metrics. */
export function EntityStatusBreakdown({
    stats,
    resolveLanguageKey,
    totalValue,
    collectedAmount,
    footer,
}: {
    stats: EntityStatusStats;
    resolveLanguageKey: ResolveLabel;
    totalValue?: number;
    collectedAmount?: number;
    footer?: React.ReactNode;
}) {
    /*
     * `totalUnits` can be supplied explicitly and is not cross-checked against the buckets, so a
     * stale `0` with non-zero buckets used to divide by 1 and render a 500%-wide bar. Fall back to
     * the bucket sum, and clamp so no segment can overflow its track.
     */
    const bucketSum = stats.sold + stats.reserved + stats.available + stats.leased + stats.blocked;
    const totalUnits = Math.max(stats.totalUnits, bucketSum, 1);
    const percent = (count: number) => Math.min(100, Math.max(0, (count / totalUnits) * 100));
    const soldPercentage = Math.round(percent(stats.sold));

    return (
        <div className="relative z-10">
            <div className="flex items-start justify-end mb-4 -mt-1">
                <div className="text-right">
                    <p className="text-xl font-display font-bold text-foreground">{soldPercentage}%</p>
                    <p className="text-3xs text-muted-foreground">{resolveLanguageKey(LABEL_KEYS.sold)}</p>
                </div>
            </div>

            <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-4">
                <div className="h-full flex">
                    <div
                        className="bg-status-sold transition-all duration-500"
                        style={{width: `${percent(stats.sold)}%`}}
                    />
                    <div
                        className="bg-status-reserved transition-all duration-500"
                        style={{width: `${percent(stats.reserved)}%`}}
                    />
                    <div
                        className="bg-primary transition-all duration-500"
                        style={{width: `${percent(stats.leased)}%`}}
                    />
                    <div
                        className="bg-status-blocked transition-all duration-500"
                        style={{width: `${percent(stats.blocked)}%`}}
                    />
                </div>
            </div>

            {/* Five fixed columns squeezed the labels below ~400px; fall back to three. */}
            <div className="grid grid-cols-3 gap-1.5 mb-4 sm:grid-cols-5">
                {(
                    [
                        ["sold", stats.sold, BREAKDOWN_TONES.sold, LABEL_KEYS.sold],
                        ["reserved", stats.reserved, BREAKDOWN_TONES.reserved, LABEL_KEYS.reserved],
                        ["available", stats.available, BREAKDOWN_TONES.available, LABEL_KEYS.available],
                        ["leased", stats.leased, BREAKDOWN_TONES.leased, LABEL_KEYS.leased],
                        ["blocked", stats.blocked, BREAKDOWN_TONES.blocked, LABEL_KEYS.blocked],
                    ] as const
                ).map(([id, value, [bg, text], labelKey]) => (
                    <div key={id} className={cn("text-center py-1.5 px-1 rounded-md", bg)}>
                        <p className={cn("text-sm font-bold", text)}>{value}</p>
                        <p className="text-3xs text-muted-foreground uppercase tracking-wide">
                            {resolveLanguageKey(labelKey)}
                        </p>
                    </div>
                ))}
            </div>

            {(totalValue != null || collectedAmount != null) && (
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    {totalValue != null && (
                        <div>
                            <p className="text-3xs text-muted-foreground">{resolveLanguageKey(LABEL_KEYS.value)}</p>
                            <p className="font-semibold text-sm text-foreground">{formatCompactCurrency(totalValue)}</p>
                        </div>
                    )}
                    {collectedAmount != null && (
                        <div className="text-right">
                            <p className="text-3xs text-muted-foreground">{resolveLanguageKey(LABEL_KEYS.collected)}</p>
                            <p className="font-semibold text-sm text-success">
                                {formatCompactCurrency(collectedAmount)}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {footer}
        </div>
    );
}
