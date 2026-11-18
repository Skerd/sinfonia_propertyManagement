import {useCallback, useMemo, useEffect, useState} from "react";
import {IconAlertTriangle, IconEye} from "@tabler/icons-react";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@coreModule/components/ui/table/table.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {ErrorView} from "@coreModule/components/custom/errors/errorView.tsx";
import {Alert, AlertDescription, AlertTitle} from "@coreModule/components/ui/alert.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import type {PaymentsHubRow} from "armonia/src/modules/propertyManagement/api/realEstate/private/paymentsHub/paymentsHub.dto.ts";
import type {PaymentsListFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/paymentsHub/paymentsHub.form.type.ts";
import type {
    PaymentsListResponseType,
    PaymentsSummaryResponseType,
} from "armonia/src/modules/propertyManagement/api/realEstate/private/paymentsHub/paymentsHub.response.type.ts";
import type {PaymentsHubGroupBy} from "armonia/src/modules/propertyManagement/api/realEstate/private/paymentsHub/paymentsHub.constants.ts";
import {formatRevenueByCurrencyLines} from "@propertyManagementModule/helpers/rentals/formatRevenueByCurrency.ts";
import {
    fmtDate,
    fmtMoney,
    paginationSummary,
} from "@propertyManagementModule/clients/panel/private/rentalsHub/rentalsHubHelpers.ts";
import {
    clientLabel,
    kindLabel,
    paymentsStatusBadgeVariant,
    type PaymentsHubScope,
    rowCode,
    scopeToBody,
    ymdOf,
} from "./paymentsHubHelpers.ts";
import PaymentsPeriodTotals from "./PaymentsPeriodTotals.tsx";

const PAGE_SIZE = 10;

type PaymentsTableSectionProps = {
    resolveLanguageKey: ResolveLanguageKey;
    timezone?: string;
    scope: PaymentsHubScope;
    groupBy: PaymentsHubGroupBy | "none";
    onGroupByChange: (groupBy: PaymentsHubGroupBy | "none") => void;
    summary: PaymentsSummaryResponseType | null;
    summaryLoading: boolean;
    /** A period heading narrows the date range to that period. */
    onScopeChange: (patch: Partial<PaymentsHubScope>) => void;
    onViewRow: (row: PaymentsHubRow) => void;
    /** Bumped after a payment is recorded so the list reloads. */
    refreshToken: number;
};

const LIST_REQUEST: HttpRequest = {method: "post", url: "/api/realEstate/paymentsHub/payments/list"};

export default function PaymentsTableSection({
    resolveLanguageKey,
    timezone,
    scope,
    groupBy,
    onGroupByChange,
    summary,
    summaryLoading,
    onScopeChange,
    onViewRow,
    refreshToken,
}: PaymentsTableSectionProps) {
    const rk = (key: string) => String(resolveLanguageKey(`list.${key}`));

    const [page, setPage] = useState(1);

    const listBody = useMemo(() => {
        const body: PaymentsListFormType = {
            ...scopeToBody(scope),
            page,
            limit: PAGE_SIZE,
            dateField: scope.dateField,
            sortOrder: scope.dateField === "paidDate" ? "desc" : "asc",
        };
        if (scope.dateFrom) body.dateFrom = scope.dateFrom;
        if (scope.dateTo) body.dateTo = scope.dateTo;
        return body;
    }, [scope, page]);
    // One list request per filter/page change and per retry.
    const [fetchCount, setFetchCount] = useState(0);
    const fetchData = useCallback(() => setFetchCount((count) => count + 1), []);
    const request = useHttpRequest<PaymentsListResponseType>(LIST_REQUEST, listBody, fetchCount);
    const data = request.error ? null : request.data;
    const loading = fetchCount === 0 || request.loading;
    const error = request.error;

    useEffect(() => {
        fetchData();
    }, [listBody, refreshToken, fetchData]);

    useEffect(() => {
        setPage(1);
    }, [scope]);

    const rows = data?.data ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    return (
        <section className="flex flex-col gap-y-4">
            {data?.truncated && (
                <Alert>
                    <IconAlertTriangle className="size-4" />
                    <AlertTitle>{rk("truncatedTitle")}</AlertTitle>
                    <AlertDescription>{rk("truncatedDescription")}</AlertDescription>
                </Alert>
            )}

            <PaymentsPeriodTotals
                resolveLanguageKey={resolveLanguageKey}
                groupBy={groupBy}
                onGroupByChange={onGroupByChange}
                summary={summary}
                loading={summaryLoading}
                onSelectPeriod={(period) =>
                    onScopeChange({dateFrom: ymdOf(period.periodStart), dateTo: ymdOf(period.periodEnd)})}
            />

            <div className="rounded-lg border overflow-hidden">
                {loading && <div className="p-8 flex justify-center"><Loader /></div>}
                {!loading && error && (
                    <div className="p-4">
                        <ErrorView
                            title={rk("errorTitle")}
                            description={rk("errorDescription")}
                            onClick={fetchData}
                            resolveLanguageKey={resolveLanguageKey}
                        />
                    </div>
                )}
                {!loading && !error && rows.length === 0 && (
                    <div className="p-8 text-center text-sm text-muted-foreground">{rk("noResults")}</div>
                )}
                {!loading && !error && rows.length > 0 && (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{rk("columns.dueDate")}</TableHead>
                                    <TableHead>{rk("columns.unit")}</TableHead>
                                    <TableHead>{rk("columns.code")}</TableHead>
                                    <TableHead>{rk("columns.project")}</TableHead>
                                    <TableHead>{rk("columns.client")}</TableHead>
                                    <TableHead>{rk("columns.type")}</TableHead>
                                    <TableHead>{rk("columns.status")}</TableHead>
                                    <TableHead className="text-right">{rk("columns.amount")}</TableHead>
                                    <TableHead className="text-right">{rk("columns.paid")}</TableHead>
                                    <TableHead className="text-right">{rk("columns.remaining")}</TableHead>
                                    <TableHead className="text-right">{rk("columns.actions")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow key={row._id}>
                                        <TableCell className="whitespace-nowrap">
                                            <span className="font-medium">{fmtDate(row.dueDate, timezone)}</span>
                                            {row.paidDate ? (
                                                <span className="block text-xs text-muted-foreground">
                                                    {rk("paidOn").replace("{date}", fmtDate(row.paidDate, timezone))}
                                                </span>
                                            ) : null}
                                        </TableCell>
                                        <TableCell>{row.unit?.unitNumber ?? row.unit?.name ?? "—"}</TableCell>
                                        <TableCell className="whitespace-nowrap">{rowCode(row) ?? "—"}</TableCell>
                                        <TableCell>{row.project?.name ?? "—"}</TableCell>
                                        <TableCell>{clientLabel(row.client)}</TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {kindLabel(row, (key) => String(resolveLanguageKey(key)))}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={paymentsStatusBadgeVariant(row.status)}>
                                                {String(resolveLanguageKey(`status.${row.status}`))}
                                            </Badge>
                                            {row.daysOverdue ? (
                                                <span className="block text-xs text-destructive">
                                                    {rk("daysOverdue").replace("{days}", String(row.daysOverdue))}
                                                </span>
                                            ) : null}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-right tabular-nums">
                                            {fmtMoney(row.amount, row.currency)}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-right tabular-nums">
                                            {fmtMoney(row.paidAmount, row.currency)}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-right tabular-nums">
                                            {fmtMoney(row.remaining, row.currency)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                aria-label={rk("viewAction")}
                                                onClick={() => onViewRow(row)}
                                            >
                                                <IconEye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {!loading && !error && total > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/30 px-4 py-3 text-sm">
                        <span className="text-muted-foreground">{rk("totalsLabel")}</span>
                        <div className="flex flex-wrap gap-x-6 gap-y-1 tabular-nums">
                            <span>
                                {rk("totalsExpected")}:{" "}
                                <strong>{formatRevenueByCurrencyLines(data?.totals.expectedAmount)}</strong>
                            </span>
                            <span>
                                {rk("totalsPaid")}:{" "}
                                <strong>{formatRevenueByCurrencyLines(data?.totals.paidAmount)}</strong>
                            </span>
                            <span>
                                {rk("totalsOutstanding")}:{" "}
                                <strong>{formatRevenueByCurrencyLines(data?.totals.outstandingAmount)}</strong>
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {!loading && !error && total > 0 && (
                <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">
                        {paginationSummary(resolveLanguageKey, "list", page, PAGE_SIZE, total)}
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            {rk("previous")}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            {rk("next")}
                        </Button>
                    </div>
                </div>
            )}
        </section>
    );
}
