import {useEffect, useMemo, useState} from "react";
import {AlertTriangle, CalendarIcon, CheckCircle2, Clock} from "lucide-react";
import type {ComponentProps} from "react";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {Alert, AlertDescription, AlertTitle} from "@coreModule/components/ui/alert.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {Calendar, CalendarDayButton} from "@coreModule/components/ui/calendar.tsx";
import {Card, CardContent, CardHeader, CardTitle} from "@coreModule/components/ui/card.tsx";
import {ScrollArea} from "@coreModule/components/ui/scroll-area.tsx";
import {Skeleton} from "@coreModule/components/ui/skeleton.tsx";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import type {HttpError} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import type {RentalPaymentRegistryRow} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalsHub/rentalsHub.payment.dto.ts";
import type {RentalsCalendarFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalsHub/rentalsHub.form.type.ts";
import type {RentalsCalendarResponseType} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalsHub/rentalsHub.response.type.ts";
import {formatRevenueByCurrencyLines} from "@propertyManagementModule/helpers/rentals/formatRevenueByCurrency.ts";
import {fmtMoney, personName, unitLabel} from "./rentalsHubHelpers.ts";

const CALENDAR_MAX_ROWS = 5000;

type DayDots = {paid: boolean; partial: boolean; overdue: boolean; pending: boolean};

function toYmd(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function monthKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function dueYmd(row: RentalPaymentRegistryRow): string | null {
    const d = row.dueDate?.slice(0, 10);
    return d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
}

function buildDayDots(rows: RentalPaymentRegistryRow[]): Map<string, DayDots> {
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

function badgeVariant(status: string): ComponentProps<typeof Badge>["variant"] {
    if (status === "paid") return "default";
    if (status === "overdue") return "destructive";
    if (status === "partially_paid") return "secondary";
    return "outline";
}

type RentalsCalendarTabProps = {
    resolveLanguageKey: ResolveLanguageKey;
    languageCode?: string;
    onViewRow: (row: RentalPaymentRegistryRow) => void;
};

export default function RentalsCalendarTab({
    resolveLanguageKey,
    languageCode,
    onViewRow,
}: RentalsCalendarTabProps) {
    const rk = (key: string) => String(resolveLanguageKey(`calendar.${key}`));
    const locale = languageCode || "en-US";
    const [calendarMonth, setCalendarMonth] = useState(() => new Date());
    const [selectedDay, setSelectedDay] = useState<Date | undefined>(() => new Date());
    const [data, setData] = useState<RentalsCalendarResponseType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<HttpError | null>(null);

    const month = monthKey(calendarMonth);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        const body: RentalsCalendarFormType = {month};
        void apiClient
            .post<RentalsCalendarResponseType>("/api/realEstate/rentalsHub/rentalPayments/calendar", body)
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
    }, [month]);

    const rows = data?.payments ?? [];
    const dayDots = useMemo(() => buildDayDots(rows), [rows]);
    const selectedYmd = selectedDay ? toYmd(selectedDay) : null;
    const dayRows = useMemo(() => {
        if (!selectedYmd) return [];
        return rows.filter((row) => dueYmd(row) === selectedYmd);
    }, [rows, selectedYmd]);

    const financeDayButton = useMemo(() => {
        function RentDayButton(props: ComponentProps<typeof CalendarDayButton>) {
            const {day, modifiers, ...rest} = props;
            const ymd = toYmd(day.date);
            const dots = dayDots.get(ymd);
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
        return RentDayButton;
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
                                <CardTitle className="text-sm font-medium">{rk("kpiCollected")}</CardTitle>
                                <CheckCircle2 className="size-4 text-success" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-lg font-semibold tabular-nums">
                                    {formatRevenueByCurrencyLines(data?.kpis.collectedAmount, locale)}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between gap-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{rk("kpiOutstanding")}</CardTitle>
                                <Clock className="size-4 text-warning" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-lg font-semibold tabular-nums">
                                    {formatRevenueByCurrencyLines(data?.kpis.outstandingAmount, locale)}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between gap-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{rk("kpiOverdue")}</CardTitle>
                                <AlertTriangle className="size-4 text-destructive" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-lg font-semibold tabular-nums">
                                    {formatRevenueByCurrencyLines(data?.kpis.overdueAmount, locale)}
                                </p>
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
                            {rk("title")}
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
                                    setSelectedDay(new Date(d.getFullYear(), d.getMonth(), 1));
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
                                ? rk("detailForDay").replace(
                                      "{date}",
                                      selectedDay.toLocaleDateString(locale, {day: "numeric", month: "long"}),
                                  )
                                : rk("selectDay")}
                        </CardTitle>
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
                                            <button
                                                type="button"
                                                className="w-full text-left"
                                                onClick={() => onViewRow(row)}
                                            >
                                                <Card>
                                                    <CardContent className="flex flex-wrap items-start justify-between gap-2 p-4">
                                                        <div className="flex min-w-0 flex-col gap-y-1">
                                                            <p className="truncate font-medium">
                                                                {personName(row.tenant)}
                                                            </p>
                                                            <p className="truncate text-xs text-muted-foreground">
                                                                {[row.lease?.name, unitLabel(row.unit)].filter(Boolean).join(" · ")}
                                                            </p>
                                                        </div>
                                                        <div className="flex shrink-0 flex-col items-end gap-1">
                                                            <span className="font-semibold tabular-nums">
                                                                {fmtMoney(row.remaining ?? row.amount, row.currency?.symbol)}
                                                            </span>
                                                            <Badge variant={badgeVariant(row.status)}>
                                                                {rk(`badge.${row.status}`)}
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
