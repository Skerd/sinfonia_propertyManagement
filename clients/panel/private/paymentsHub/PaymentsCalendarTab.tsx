import {useEffect, useMemo, useState} from "react";
import type {ComponentProps} from "react";
import {AlertTriangle, CalendarIcon} from "lucide-react";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {Alert, AlertDescription, AlertTitle} from "@coreModule/components/ui/alert.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {Calendar, CalendarDayButton} from "@coreModule/components/ui/calendar.tsx";
import {Card, CardContent, CardHeader, CardTitle} from "@coreModule/components/ui/card.tsx";
import {ScrollArea} from "@coreModule/components/ui/scroll-area.tsx";
import {Skeleton} from "@coreModule/components/ui/skeleton.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import type {HttpError} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import type {PaymentsHubRow} from "armonia/src/modules/propertyManagement/api/realEstate/private/paymentsHub/paymentsHub.dto.ts";
import type {PaymentsCalendarFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/paymentsHub/paymentsHub.form.type.ts";
import type {PaymentsCalendarResponseType} from "armonia/src/modules/propertyManagement/api/realEstate/private/paymentsHub/paymentsHub.response.type.ts";
import {formatRevenueByCurrencyLines} from "@propertyManagementModule/helpers/rentals/formatRevenueByCurrency.ts";
import {fmtMoney, unitLabel} from "@propertyManagementModule/clients/panel/private/rentalsHub/rentalsHubHelpers.ts";
import {clientLabel, kindLabel, paymentsStatusBadgeVariant, type PaymentsHubScope, scopeToBody} from "./paymentsHubHelpers.ts";

const CALENDAR_MAX_ROWS = 5000;

type DayDots = {paid: boolean; partial: boolean; overdue: boolean; pending: boolean};

function toYmd(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function monthKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function dueYmd(row: PaymentsHubRow): string | null {
    const d = row.dueDate?.slice(0, 10);
    return d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
}

function buildDayDots(rows: PaymentsHubRow[]): Map<string, DayDots> {
    const map = new Map<string, DayDots>();
    for (const row of rows) {
        const ymd = dueYmd(row);
        if (!ymd) continue;
        const prev = map.get(ymd) ?? {paid: false, partial: false, overdue: false, pending: false};
        if (row.status === "paid") prev.paid = true;
        else if (row.status === "partially_paid") prev.partial = true;
        else if (row.status === "overdue") prev.overdue = true;
        else if (row.status === "pending") prev.pending = true;
        map.set(ymd, prev);
    }
    return map;
}

/** Sum the rows on screen, one line per currency — same shape the KPI tiles use. */
function sumByCurrency(
    rows: PaymentsHubRow[],
    pick: (row: PaymentsHubRow) => number | undefined,
): {currencyId: string; currencyName?: string; currencySymbol?: string; value: number}[] {
    const map = new Map<string, {currencyId: string; currencyName?: string; currencySymbol?: string; value: number}>();
    for (const row of rows) {
        const value = pick(row);
        if (!value) continue;
        const currencyId = row.currency?._id ?? "_none";
        const prev = map.get(currencyId) ?? {
            currencyId,
            currencyName: row.currency?.name,
            currencySymbol: row.currency?.symbol,
            value: 0,
        };
        prev.value += value;
        map.set(currencyId, prev);
    }
    return [...map.values()].map((row) => ({...row, value: Math.round(row.value * 100) / 100}));
}

type PaymentsCalendarTabProps = {
    resolveLanguageKey: ResolveLanguageKey;
    locale: string;
    scope: PaymentsHubScope;
    onViewRow: (row: PaymentsHubRow) => void;
    refreshToken: number;
};

export default function PaymentsCalendarTab({
    resolveLanguageKey,
    locale,
    scope,
    onViewRow,
    refreshToken,
}: PaymentsCalendarTabProps) {
    const rk = (key: string) => String(resolveLanguageKey(`calendar.${key}`));
    const [calendarMonth, setCalendarMonth] = useState(() => new Date());
    const [selectedDay, setSelectedDay] = useState<Date | undefined>(() => new Date());
    const [data, setData] = useState<PaymentsCalendarResponseType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<HttpError | null>(null);

    const month = monthKey(calendarMonth);
    const scopeBody = useMemo(() => scopeToBody(scope), [scope]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        const body: PaymentsCalendarFormType = {...scopeBody, month};
        void apiClient
            .post<PaymentsCalendarResponseType>("/api/realEstate/paymentsHub/payments/calendar", body)
            .then((res) => {
                if (!cancelled) setData(res.data);
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err as HttpError);
                    setData(null);
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [month, scopeBody, refreshToken]);

    const rows = data?.payments ?? [];
    const dayDots = useMemo(() => buildDayDots(rows), [rows]);
    const selectedYmd = selectedDay ? toYmd(selectedDay) : null;
    const dayRows = useMemo(
        () => (selectedYmd ? rows.filter((row) => dueYmd(row) === selectedYmd) : []),
        [rows, selectedYmd],
    );
    const monthTotal = useMemo(() => sumByCurrency(rows, (row) => row.amount), [rows]);
    const dayTotal = useMemo(() => sumByCurrency(dayRows, (row) => row.amount), [dayRows]);

    const paymentsDayButton = useMemo(() => {
        function PaymentsDayButton(props: ComponentProps<typeof CalendarDayButton>) {
            const {day, modifiers, ...rest} = props;
            const dots = dayDots.get(toYmd(day.date));
            return (
                <CalendarDayButton day={day} modifiers={modifiers} {...rest}>
                    <span className="tabular-nums">{day.date.getDate()}</span>
                    {dots && (dots.paid || dots.partial || dots.overdue || dots.pending) ? (
                        <span className="flex h-2 justify-center gap-0.5">
                            {dots.paid ? <span className="size-1 shrink-0 rounded-full bg-success" /> : null}
                            {dots.partial ? <span className="size-1 shrink-0 rounded-full bg-warning" /> : null}
                            {dots.overdue ? <span className="size-1 shrink-0 rounded-full bg-destructive" /> : null}
                            {dots.pending ? <span className="size-1 shrink-0 rounded-full bg-muted-foreground" /> : null}
                        </span>
                    ) : null}
                </CalendarDayButton>
            );
        }
        return PaymentsDayButton;
    }, [dayDots]);

    return (
        <div className="flex flex-col gap-4">
            {error != null && (
                <Alert variant="destructive">
                    <AlertTriangle className="size-4" />
                    <AlertTitle>{rk("errorTitle")}</AlertTitle>
                    <AlertDescription>{rk("errorDescription")}</AlertDescription>
                </Alert>
            )}
            {data?.truncated && (
                <Alert>
                    <AlertTriangle className="size-4" />
                    <AlertTitle>{rk("truncatedTitle")}</AlertTitle>
                    <AlertDescription>
                        {rk("truncatedDescription").replace("{max}", String(CALENDAR_MAX_ROWS))}
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-4 lg:grid-cols-[minmax(0,auto)_1fr]">
                <Card className="w-fit min-w-0 max-w-full">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <CalendarIcon className="size-4" />
                            {rk("title")}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                            {rk("monthTotal").replace("{total}", formatRevenueByCurrencyLines(monthTotal, locale))}
                        </p>
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
                                    setSelectedDay(new Date(d.getFullYear(), d.getMonth(), 1));
                                }}
                                selected={selectedDay}
                                onSelect={(d) => {
                                    if (d) setSelectedDay(d);
                                }}
                                captionLayout="dropdown"
                                showOutsideDays
                                className="rounded-lg border border-border p-1"
                                components={{DayButton: paymentsDayButton}}
                            />
                        )}
                    </CardContent>
                </Card>

                <Card className="min-h-[280px] min-w-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                            {selectedDay
                                ? rk("detailForDay").replace(
                                    "{date}",
                                    selectedDay.toLocaleDateString(locale, {day: "numeric", month: "long"}),
                                )
                                : rk("selectDay")}
                        </CardTitle>
                        {dayRows.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                                {rk("dayTotal").replace("{total}", formatRevenueByCurrencyLines(dayTotal, locale))}
                            </p>
                        )}
                    </CardHeader>
                    <CardContent className="pt-0">
                        <ScrollArea className="h-[min(480px,calc(100vh-320px))] pe-2">
                            {loading ? (
                                <div className="flex flex-col gap-y-2">
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                </div>
                            ) : dayRows.length === 0 ? (
                                <p className="text-sm text-muted-foreground">{rk("noPaymentsDay")}</p>
                            ) : (
                                <ul className="flex flex-col gap-2">
                                    {dayRows.map((row) => (
                                        <li key={row._id}>
                                            <button type="button" className="w-full text-left" onClick={() => onViewRow(row)}>
                                                <Card>
                                                    <CardContent className="flex flex-wrap items-start justify-between gap-2 p-4">
                                                        <div className="flex min-w-0 flex-col gap-y-1">
                                                            <p className="truncate font-medium">{clientLabel(row.client)}</p>
                                                            <p className="truncate text-xs text-muted-foreground">
                                                                {[
                                                                    unitLabel(row.unit),
                                                                    row.saleCode,
                                                                    kindLabel(row, (key) => String(resolveLanguageKey(key))),
                                                                ].filter(Boolean).join(" · ")}
                                                            </p>
                                                        </div>
                                                        <div className="flex shrink-0 flex-col items-end gap-1">
                                                            <span className="font-semibold tabular-nums">
                                                                {fmtMoney(row.remaining || row.amount, row.currency?.symbol)}
                                                            </span>
                                                            <Badge variant={paymentsStatusBadgeVariant(row.status)}>
                                                                {String(resolveLanguageKey(`status.${row.status}`))}
                                                            </Badge>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
