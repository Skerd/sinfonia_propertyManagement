import {Button} from "@coreModule/components/ui/button.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@coreModule/components/ui/select.tsx";

export const DASHBOARD_PERIOD_OPTIONS: {
    value: string;
    fromDaysAgo: number;
    toDaysAgo: number;
    period: "week" | "month";
}[] = [
    {value: "last7", fromDaysAgo: 7, toDaysAgo: 0, period: "week"},
    {value: "last30", fromDaysAgo: 30, toDaysAgo: 0, period: "month"},
    {value: "last3months", fromDaysAgo: 90, toDaysAgo: 0, period: "month"},
    {value: "last12months", fromDaysAgo: 365, toDaysAgo: 0, period: "month"},
];

type DashboardPeriodToolbarProps = {
    periodKey: string;
    onPeriodChange: (value: string) => void;
    onRefresh: () => void;
    periodLabel: string;
    periodLast7Days: string;
    periodLast30Days: string;
    periodLast3Months: string;
    periodLast12Months: string;
    refreshLabel: string;
    selectWidthClass?: string;
};

export function DashboardPeriodToolbar({
    periodKey,
    onPeriodChange,
    onRefresh,
    periodLabel,
    periodLast7Days,
    periodLast30Days,
    periodLast3Months,
    periodLast12Months,
    refreshLabel,
    selectWidthClass = "w-[180px]",
}: DashboardPeriodToolbarProps) {
    return (
        <div className="flex items-center gap-2">
            <Select value={periodKey} onValueChange={onPeriodChange}>
                <SelectTrigger className={selectWidthClass} size="default">
                    <SelectValue placeholder={periodLabel} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="last7">{periodLast7Days}</SelectItem>
                    <SelectItem value="last30">{periodLast30Days}</SelectItem>
                    <SelectItem value="last3months">{periodLast3Months}</SelectItem>
                    <SelectItem value="last12months">{periodLast12Months}</SelectItem>
                </SelectContent>
            </Select>
            <Button onClick={onRefresh}>{refreshLabel}</Button>
        </div>
    );
}

export function toISODate(d: Date): string {
    return d.toISOString().slice(0, 10);
}

export function buildDashboardFilter(
    periodKey: string,
    extra?: {edificeId?: string | null},
) {
    const opt =
        DASHBOARD_PERIOD_OPTIONS.find((o) => o.value === periodKey) ??
        DASHBOARD_PERIOD_OPTIONS[3];
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - opt.fromDaysAgo);
    const filter: {from: string; to: string; period: "week" | "month"; edificeId?: string} = {
        from: toISODate(from),
        to: toISODate(to),
        period: opt.period,
    };
    if (extra?.edificeId) filter.edificeId = extra.edificeId;
    return filter;
}
