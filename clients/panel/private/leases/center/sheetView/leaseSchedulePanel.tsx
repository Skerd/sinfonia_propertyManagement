import {useCallback, useContext, useEffect, useMemo, useState} from "react";
import {DATE_FORMATS, formatDate} from "@coreModule/helpers/general/dateTime.ts";
import {IconDots} from "@tabler/icons-react";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {useCompanyTimeZone} from "@coreModule/helpers/hooks/useCompanyTimeZone.ts";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";
import {toneSwatchClass} from "@coreModule/components/entityPage/list/table/columnConfigToColumnDef.tsx";
import {useEnumTones} from "@coreModule/helpers/hooks/useEnumTones.ts";
import {Button} from "@coreModule/components/ui/button.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@coreModule/components/ui/table/table.tsx";
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@coreModule/components/ui/dropdown-menu.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import type {Lease} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/lease.dto.ts";
import type {RentalPayment} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalPayment/rentalPayment.dto.ts";
import type {TableForm, TableResponse} from "armonia/src/modules/core/types/shared.types.ts";
import MarkRentalPaymentPaid, {MARK_RENTAL_PAYMENT_PAID_ACTION} from "@propertyManagementModule/clients/panel/private/rentalPayments/center/actions/markPaid.tsx";
import WaiveRentalPayment, {WAIVE_RENTAL_PAYMENT_ACTION} from "@propertyManagementModule/clients/panel/private/rentalPayments/center/actions/waive.tsx";
import ManualRentClientEmails, {
    rentHasVisibleManualEmailActions,
} from "@propertyManagementModule/clients/panel/private/leases/center/actions/manualRentClientEmails.tsx";
import MarkRentalPaymentPaidDialog from "@propertyManagementModule/components/custom/rentalPayments/markRentalPaymentPaidDialog.tsx";
import WaiveRentalPaymentDialog from "@propertyManagementModule/components/custom/rentalPayments/waiveRentalPaymentDialog.tsx";
import RecordRentPaymentDialog from "@propertyManagementModule/components/custom/leases/recordRentPaymentDialog.tsx";
import {RECORD_RENT_PAYMENT_ACTION} from "@propertyManagementModule/clients/panel/private/leases/center/actions/recordRentPayment.tsx";
import {formatNumber} from "@coreModule/helpers/general/numbers.ts";
import {LeaseScheduleRequest} from "@propertyManagementModule/clients/panel/private/leases/center/sheetView/leaseScheduleRequest.ts";

const LEASE_PAYMENTS_REQUEST: HttpRequest = {method: "post", url: "/api/realEstate/rentalPayment"};
/** The list API's page cap; a longer lease is read page by page (TD-F82). */
const SCHEDULE_PAGE_SIZE = 200;
const OPEN_STATUSES = new Set(["pending", "overdue", "partially_paid"]);

type LeaseSchedulePanelProps = {
    lease: Lease;
    /** The lease sheet's dictionary, which holds the schedule's labels. */
    resolveLanguageKey: ResolveLanguageKey;
};

function money(value: number | undefined, symbol?: string): string {
    if (value == null) return "—";
    const n = formatNumber(value, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    return symbol ? `${n} ${symbol}` : n;
}

function resolveStatusLabel(resolveLanguageKey: ResolveLanguageKey, raw?: string): string {
    if (!raw) return "—";
    const key = `schedule.statuses.${raw}`;
    const resolved = resolveLanguageKey(key);
    return resolved === `---${key}---` ? raw : String(resolved);
}

/** The lease's rent months with their collect, waive and email actions, placed by the sheet view above Lifecycle (UX-03). */
export default function LeaseSchedulePanel({lease, resolveLanguageKey}: LeaseSchedulePanelProps) {
    const {requestedAction, onRequestedActionHandled} = useContext(LeaseScheduleRequest);
    const paymentAccess = useAccess("rentalpayments");
    const leaseAccess = useAccess("leases");
    const timeZone = useCompanyTimeZone();
    // The rent months take the rental payment model's tones, like its table (UX-02, TD-F72).
    const statusTones = useEnumTones("rentalPayments", "status");
    const leaseRead =
        typeof leaseAccess.read === "object" && leaseAccess.read !== null
            ? (leaseAccess.read as Record<string, unknown>)
            : {};
    const canReadTenant = leaseRead.tenant !== undefined;

    const [localNonce, setLocalNonce] = useState(0);
    const [selected, setSelected] = useState<RentalPayment | null>(null);
    const [action, setAction] = useState("");

    const refetch = useCallback(() => setLocalNonce((n) => n + 1), []);

    // The lease's schedule, reloaded from its first month after every change made here. The list API returns at most
    // 200 rows a page, so a lease longer than about 16 years is read page by page until every month is in (TD-F82).
    const [fetchCount, setFetchCount] = useState(0);
    const [offset, setOffset] = useState(0);
    const [payments, setPayments] = useState<RentalPayment[]>([]);
    useEffect(() => {
        if (!lease._id) return;
        setOffset(0);
        setFetchCount((count) => count + 1);
    }, [lease._id, localNonce]);
    const paymentsBody = useMemo(
        () => ({offset, limit: SCHEDULE_PAGE_SIZE, lease: lease._id, sortBy: "dueDate", sortOrder: "asc"}) satisfies TableForm & {lease: string},
        [lease._id, offset],
    );
    useHttpRequest<TableResponse<RentalPayment>>(LEASE_PAYMENTS_REQUEST, paymentsBody, fetchCount, true, {
        success: (page) => {
            const rows = page.data;
            setPayments((loaded) => (offset === 0 ? rows : [...loaded, ...rows]));
            const next = offset + rows.length;
            if (rows.length > 0 && next < page.total) {
                setOffset(next);
                setFetchCount((count) => count + 1);
            }
        },
    });

    useEffect(() => {
        if (requestedAction === RECORD_RENT_PAYMENT_ACTION) {
            setAction(RECORD_RENT_PAYMENT_ACTION);
            onRequestedActionHandled();
        }
    }, [requestedAction, onRequestedActionHandled]);

    const symbol = lease.rentCurrency?.symbol ?? payments[0]?.currency?.symbol;
    const kpis = useMemo(() => {
        let due = 0;
        let collected = 0;
        let remaining = 0;
        let overdue = 0;
        for (const row of payments) {
            if (row.status === "waived") continue;
            due += (row.amount ?? 0) + (row.lateFeeAmount ?? 0);
            collected += row.paidAmount ?? 0;
            remaining += row.remaining ?? 0;
            if (row.status === "overdue") overdue += row.remaining ?? 0;
        }
        return {due, collected, remaining, overdue};
    }, [payments]);

    const rk = (key: string) => String(resolveLanguageKey(key));

    return (
        <div className="flex flex-col gap-y-3">
            {/* The sheet group above carries the title. */}
            {lease.status === "active" && !!paymentAccess.write && (
                <div className="flex justify-end">
                    <Button type="button" size="sm" onClick={() => setAction(RECORD_RENT_PAYMENT_ACTION)}>
                        {rk("schedule.recordPayment")}
                    </Button>
                </div>
            )}

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-md border border-border/50 bg-muted/20 p-2">
                    <p className="text-2xs text-muted-foreground">{rk("schedule.kpiDue")}</p>
                    <p className="text-sm font-semibold tabular-nums">{money(kpis.due, symbol)}</p>
                </div>
                <div className="rounded-md border border-border/50 bg-muted/20 p-2">
                    <p className="text-2xs text-muted-foreground">{rk("schedule.kpiCollected")}</p>
                    <p className="text-sm font-semibold tabular-nums">{money(kpis.collected, symbol)}</p>
                </div>
                <div className="rounded-md border border-border/50 bg-muted/20 p-2">
                    <p className="text-2xs text-muted-foreground">{rk("schedule.kpiRemaining")}</p>
                    <p className="text-sm font-semibold tabular-nums">{money(kpis.remaining, symbol)}</p>
                </div>
                <div className="rounded-md border border-border/50 bg-muted/20 p-2">
                    <p className="text-2xs text-muted-foreground">{rk("schedule.kpiOverdue")}</p>
                    <p className="text-sm font-semibold tabular-nums">{money(kpis.overdue, symbol)}</p>
                </div>
            </div>

            {payments.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {payments.map((row) => {
                        const canPay = OPEN_STATUSES.has(row.status ?? "") && (row.remaining ?? 0) > 0;
                        return (
                            <Button
                                type="button"
                                variant="bare"
                                key={row._id}
                                title={`${row.dueDate} · ${resolveStatusLabel(resolveLanguageKey, row.status)}`}
                                className={cn("size-5 rounded-sm border border-border/40", toneSwatchClass(row.status ? statusTones?.[row.status] : undefined), canPay && "cursor-pointer")}
                                onClick={() => {
                                    if (!canPay) return;
                                    setSelected(row);
                                    setAction(MARK_RENTAL_PAYMENT_PAID_ACTION);
                                }}
                            />
                        );
                    })}
                </div>
            )}

            {payments.length ? (
                <div className="rounded-lg border border-border/50 bg-muted/20 p-2">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{rk("schedule.dueDate")}</TableHead>
                                <TableHead>{rk("schedule.amount")}</TableHead>
                                <TableHead>{rk("schedule.lateFee")}</TableHead>
                                <TableHead>{rk("schedule.paid")}</TableHead>
                                <TableHead>{rk("schedule.remaining")}</TableHead>
                                <TableHead>{rk("schedule.status")}</TableHead>
                                <TableHead className="text-right">{rk("schedule.actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.map((row) => {
                                const showPay = OPEN_STATUSES.has(row.status ?? "") && (row.remaining ?? 0) > 0 && !!paymentAccess.write;
                                const showEmails = canReadTenant && rentHasVisibleManualEmailActions(row, timeZone);
                                const showMenu = showPay || showEmails;
                                return (
                                    <TableRow key={row._id}>
                                        <TableCell className="whitespace-nowrap">
                                            {row.dueDate ? formatDate(row.dueDate, {timeZone: "UTC", format: DATE_FORMATS.mediumDate}) : "—"}
                                        </TableCell>
                                        <TableCell className="tabular-nums">{money(row.amount, symbol)}</TableCell>
                                        <TableCell className="tabular-nums">{money(row.lateFeeAmount ?? 0, symbol)}</TableCell>
                                        <TableCell className="tabular-nums">{money(row.paidAmount ?? 0, symbol)}</TableCell>
                                        <TableCell className="tabular-nums">{money(row.remaining, symbol)}</TableCell>
                                        <TableCell>
                                            <StatusBadge
                                                tableConfigKey="rentalPayments"
                                                field="status"
                                                value={row.status}
                                                label={resolveStatusLabel(resolveLanguageKey, row.status)}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {showMenu ? (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button type="button" variant="ghost" size="icon">
                                                            <IconDots className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                                        <MarkRentalPaymentPaid
                                                            payment={row}
                                                            onAction={(next: string) => {
                                                                setSelected(row);
                                                                setAction(next);
                                                            }}
                                                        />
                                                        <WaiveRentalPayment
                                                            payment={row}
                                                            onAction={(next: string) => {
                                                                setSelected(row);
                                                                setAction(next);
                                                            }}
                                                        />
                                                        {showEmails ? (
                                                            <ManualRentClientEmails payment={row} />
                                                        ) : null}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            ) : null}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <p className="text-xs text-muted-foreground">{rk("schedule.empty")}</p>
            )}

            {action === MARK_RENTAL_PAYMENT_PAID_ACTION && selected && (
                <MarkRentalPaymentPaidDialog
                    open
                    onClose={() => {
                        setAction("");
                        setSelected(null);
                    }}
                    payment={selected}
                    onSuccess={() => refetch()}
                />
            )}
            {action === WAIVE_RENTAL_PAYMENT_ACTION && selected && (
                <WaiveRentalPaymentDialog
                    open
                    onClose={() => {
                        setAction("");
                        setSelected(null);
                    }}
                    payment={selected}
                    onSuccess={() => refetch()}
                />
            )}
            {action === RECORD_RENT_PAYMENT_ACTION && (
                <RecordRentPaymentDialog
                    open
                    onClose={() => setAction("")}
                    lease={lease}
                    payments={payments}
                    onSuccess={() => refetch()}
                />
            )}
        </div>
    );
}
