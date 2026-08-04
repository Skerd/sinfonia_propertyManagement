import { useMemo, useState } from "react";
import type { FinanceToolbarValues } from "@propertyManagementModule/clients/panel/private/unitCosts/financeUnitCostFilterBar.tsx";
import { compose } from "redux";
import { AlertTriangle, CalendarIcon, CheckCircle2, Clock } from "lucide-react";
import type { ComponentProps } from "react";
import type { UnitCost } from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unitCost/unitCost.dto.ts";
import { Alert, AlertDescription, AlertTitle } from "@coreModule/components/ui/alert.tsx";
import { Badge } from "@coreModule/components/ui/badge.tsx";
import { Calendar, CalendarDayButton } from "@coreModule/components/ui/calendar.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@coreModule/components/ui/card.tsx";
import { ScrollArea } from "@coreModule/components/ui/scroll-area.tsx";
import { Skeleton } from "@coreModule/components/ui/skeleton.tsx";
import withLanguage, { WithLanguageType } from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {
    addToCurrencyMap,
    deriveCalendarLedgerCategory,
    formatCurrencyLine,
    paymentDateYmd,
    type CurrencySubtotalMap,
    type FinanceCalendarLedgerCategory,
} from "@propertyManagementModule/helpers/components/unitCosts/financeCalendarLedger.ts";
import { FINANCE_CALENDAR_MAX_ROWS, useFinanceCalendarMonth } from "@propertyManagementModule/helpers/components/unitCosts/useFinanceCalendarMonth.ts";

type DayDots = { paid: boolean; pending: boolean; overdue: boolean };

function toYmd(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function emptyCurrencyMap(): CurrencySubtotalMap {
    return new Map();
}

function sumSubtotal(cost: UnitCost): number {
    const v = cost.documentSubtotal;
    return typeof v === "number" && !Number.isNaN(v) ? v : 0;
}

function aggregateKpis(rows: UnitCost[], locale: string) {
    const paid = emptyCurrencyMap();
    const pending = emptyCurrencyMap();
    const overdue = emptyCurrencyMap();
    for (const cost of rows) {
        const cat = deriveCalendarLedgerCategory(cost);
        const amt = sumSubtotal(cost);
        const target = cat === "paid" ? paid : cat === "overdue" ? overdue : pending;
        addToCurrencyMap(target, cost, amt);
    }
    const fmt = (m: CurrencySubtotalMap) =>
        [...m.values()]
            .map((e) => formatCurrencyLine(e, locale))
            .filter(Boolean)
            .join(" · ") || "—";
    return {
        paidLine: fmt(paid),
        pendingLine: fmt(pending),
        overdueLine: fmt(overdue),
    };
}

function buildDayDots(rows: UnitCost[]): Map<string, DayDots> {
    const map = new Map<string, DayDots>();
    for (const cost of rows) {
        const ymd = paymentDateYmd(cost);
        if (!ymd) continue;
        const cat = deriveCalendarLedgerCategory(cost);
        const prev = map.get(ymd) ?? { paid: false, pending: false, overdue: false };
        if (cat === "paid") prev.paid = true;
        else if (cat === "overdue") prev.overdue = true;
        else prev.pending = true;
        map.set(ymd, prev);
    }
    return map;
}

function badgeVariant(cat: FinanceCalendarLedgerCategory): ComponentProps<typeof Badge>["variant"] {
    if (cat === "paid") return "default";
    if (cat === "overdue") return "destructive";
    return "secondary";
}

type PaymentCalendarTabProps = WithLanguageType & {
    /** When navigating from a unit context, restricts data to this unit (toolbar unit hidden). */
    embeddedUnitId?: string;
    appliedFinanceFilters: FinanceToolbarValues;
};

function PaymentCalendarTab({
    resolveLanguageKey,
    languageCode,
    embeddedUnitId,
    appliedFinanceFilters,
}: PaymentCalendarTabProps) {
    const [calendarMonth, setCalendarMonth] = useState(() => new Date());
    const [selectedDay, setSelectedDay] = useState<Date | undefined>(() => new Date());

    const calendarFetchOpts = useMemo(
        () => ({
            unitId: embeddedUnitId?.trim()
                ? embeddedUnitId.trim()
                : appliedFinanceFilters.unitId?.trim() || undefined,
            verificationStatus: appliedFinanceFilters.verificationStatus?.trim() || undefined,
            paymentStatus: appliedFinanceFilters.paymentStatus?.trim() || undefined,
            vendorContains: appliedFinanceFilters.vendorContains,
            purchasePersonId: appliedFinanceFilters.purchasePersonId,
        }),
        [embeddedUnitId, appliedFinanceFilters],
    );

    const { rows, loading, error, truncated } = useFinanceCalendarMonth(calendarMonth, calendarFetchOpts);

    const dayDots = useMemo(() => buildDayDots(rows), [rows]);
    const kpis = useMemo(() => aggregateKpis(rows, languageCode || "en-US"), [rows, languageCode]);

    const selectedYmd = selectedDay ? toYmd(selectedDay) : null;
    const dayCosts = useMemo(() => {
        if (!selectedYmd) return [];
        return rows.filter((c) => paymentDateYmd(c) === selectedYmd);
    }, [rows, selectedYmd]);

    const str = (key: string) => String(resolveLanguageKey(key));

    const financeDayButton = useMemo(() => {
        function FinanceDayButton(props: ComponentProps<typeof CalendarDayButton>) {
            const { day, modifiers, ...rest } = props;
            const ymd = toYmd(day.date);
            const dots = dayDots.get(ymd);
            return (
                <CalendarDayButton day={day} modifiers={modifiers} {...rest}>
                    <span className="tabular-nums">{day.date.getDate()}</span>
                    {dots && (dots.paid || dots.pending || dots.overdue) ? (
                        <span className="flex h-2 justify-center gap-0.5">
                            {dots.paid ? <span className="size-1 shrink-0 rounded-full bg-success" /> : null}
                            {dots.pending ? <span className="size-1 shrink-0 rounded-full bg-warning" /> : null}
                            {dots.overdue ? <span className="size-1 shrink-0 rounded-full bg-destructive" /> : null}
                        </span>
                    ) : null}
                </CalendarDayButton>
            );
        }
        return FinanceDayButton;
    }, [dayDots]);

    return (
        <div className="flex flex-col gap-4">
            {error != null && (
                <Alert variant="destructive">
                    <AlertTriangle className="size-4" />
                    <AlertTitle>{str("calendar.errorTitle")}</AlertTitle>
                    <AlertDescription>{str("calendar.errorDescription")}</AlertDescription>
                </Alert>
            )}
            {truncated && (
                <Alert>
                    <AlertTriangle className="size-4" />
                    <AlertTitle>{str("calendar.truncatedTitle")}</AlertTitle>
                    <AlertDescription>
                        {str("calendar.truncatedDescription").replace("{max}", String(FINANCE_CALENDAR_MAX_ROWS))}
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-3 sm:grid-cols-3">
                {loading ? (
                    <>
                        <Skeleton className="h-24 rounded-xl" />
                        <Skeleton className="h-24 rounded-xl" />
                        <Skeleton className="h-24 rounded-xl" />
                    </>
                ) : (
                    <>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between gap-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{str("calendar.kpiPaid")}</CardTitle>
                                <CheckCircle2 className="size-4 text-success" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-lg font-semibold tabular-nums">{kpis.paidLine}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between gap-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{str("calendar.kpiPending")}</CardTitle>
                                <Clock className="size-4 text-warning" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-lg font-semibold tabular-nums">{kpis.pendingLine}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between gap-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{str("calendar.kpiOverdue")}</CardTitle>
                                <AlertTriangle className="size-4 text-destructive" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-lg font-semibold tabular-nums">{kpis.overdueLine}</p>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,auto)_1fr]">
                <Card className="w-fit min-w-0 max-w-full">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <CalendarIcon className="size-4" />
                            {str("calendar.financialCalendarTitle")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {loading ? (
                            <Skeleton className="h-[320px] w-[min(100%,320px)] rounded-lg" />
                        ) : (
                            <Calendar
                                mode="single"
                                month={calendarMonth}
                                onMonthChange={(d) => {
                                    setCalendarMonth(d);
                                    const first = new Date(d.getFullYear(), d.getMonth(), 1);
                                    setSelectedDay(first);
                                }}
                                selected={selectedDay}
                                onSelect={(d) => {
                                    if (d) setSelectedDay(d);
                                }}
                                captionLayout="dropdown"
                                showOutsideDays
                                className="rounded-lg border border-border p-1"
                                components={{
                                    DayButton: financeDayButton,
                                }}
                            />
                        )}
                    </CardContent>
                </Card>

                <Card className="min-h-[280px] min-w-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                            {selectedDay
                                ? str("calendar.detailForDay").replace(
                                      "{date}",
                                      selectedDay.toLocaleDateString(languageCode || "en-US", {
                                          day: "numeric",
                                          month: "long",
                                      }),
                                  )
                                : str("calendar.selectDay")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <ScrollArea className="h-[min(480px,calc(100vh-320px))] pe-2">
                            {loading ? (
                                <div className="flex flex-col gap-y-2">
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                </div>
                            ) : dayCosts.length === 0 ? (
                                <p className="text-sm text-muted-foreground">{str("calendar.noPaymentsDay")}</p>
                            ) : (
                                <ul className="flex flex-col gap-2">
                                    {dayCosts.map((cost) => {
                                        const cat = deriveCalendarLedgerCategory(cost);
                                        return (
                                            <li key={cost._id}>
                                                <Card>
                                                    <CardContent className="flex flex-wrap items-start justify-between gap-2 p-4">
                                                        <div className="flex flex-col min-w-0 gap-y-1">
                                                            <p className="truncate font-medium">
                                                                {cost.purchasePerson?.name}{" "}
                                                                {cost.purchasePerson?.surname ?? ""}
                                                            </p>
                                                            <p className="truncate text-xs text-muted-foreground">
                                                                {cost.name}
                                                                {cost.unit?.name || cost.unit?.unitNumber
                                                                    ? ` · ${[cost.unit.name, cost.unit.unitNumber].filter(Boolean).join(" ")}`
                                                                    : ""}
                                                            </p>
                                                        </div>
                                                        <div className="flex shrink-0 flex-col items-end gap-1">
                                                            <span className="font-semibold tabular-nums">
                                                                {formatCurrencyLine(
                                                                    {
                                                                        symbol: cost.currency?.symbol,
                                                                        abbreviation: cost.currency?.abbreviation,
                                                                        total: sumSubtotal(cost),
                                                                    },
                                                                    languageCode || "en-US",
                                                                )}
                                                            </span>
                                                            <Badge variant={badgeVariant(cat)}>
                                                                {str(`calendar.badge.${cat}`)}
                                                            </Badge>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/unitCosts/index.tsx"),
    withDebug(true, true),
)(PaymentCalendarTab);
