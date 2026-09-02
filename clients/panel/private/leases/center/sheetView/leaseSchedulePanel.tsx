import {useCallback, useEffect, useMemo, useState} from "react";
import {format} from "date-fns";
import {MoreHorizontal} from "lucide-react";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@coreModule/components/ui/table/table.tsx";
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@coreModule/components/ui/dropdown-menu.tsx";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
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

const OPEN_STATUSES = new Set(["pending", "overdue", "partially_paid"]);

type LeaseSchedulePanelProps = {
    lease: Lease;
    resolveLanguageKey: ResolveLanguageKey;
    refreshNonce?: number;
    requestedAction?: string;
    onRequestedActionHandled?: () => void;
    onScheduleChanged?: () => void;
};

function money(value: number | undefined, symbol?: string): string {
    if (value == null) return "—";
    const n = value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    return symbol ? `${n} ${symbol}` : n;
}

function statusStyles(status?: string): {bg: string; text: string; border: string; cell: string} {
    const lowered = status?.toLowerCase() ?? "";
    if (lowered === "paid") {
        return {bg: "bg-success/10", text: "text-success", border: "border-success/30", cell: "bg-success"};
    }
    if (lowered === "overdue") {
        return {bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/30", cell: "bg-destructive"};
    }
    if (lowered === "partially_paid") {
        return {bg: "bg-warning/10", text: "text-warning", border: "border-warning/30", cell: "bg-warning"};
    }
    if (lowered === "waived") {
        return {bg: "bg-muted/50", text: "text-muted-foreground", border: "border-muted", cell: "bg-muted-foreground/40"};
    }
    return {bg: "bg-muted/50", text: "text-muted-foreground", border: "border-muted", cell: "bg-muted-foreground/20"};
}

function resolveStatusLabel(resolveLanguageKey: ResolveLanguageKey, raw?: string): string {
    if (!raw) return "—";
    const key = `schedule.statuses.${raw}`;
    const resolved = resolveLanguageKey(key);
    return resolved === `---${key}---` ? raw : String(resolved);
}

export default function LeaseSchedulePanel({
    lease,
    resolveLanguageKey,
    refreshNonce = 0,
    requestedAction,
    onRequestedActionHandled,
    onScheduleChanged,
}: LeaseSchedulePanelProps) {
    const paymentAccess = useAccess("rentalpayments");
    const leaseAccess = useAccess("leases");
    const leaseRead =
        typeof leaseAccess.read === "object" && leaseAccess.read !== null
            ? (leaseAccess.read as Record<string, unknown>)
            : {};
    const canReadTenant = leaseRead.tenant !== undefined;

    const [payments, setPayments] = useState<RentalPayment[]>([]);
    const [localNonce, setLocalNonce] = useState(0);
    const [selected, setSelected] = useState<RentalPayment | null>(null);
    const [action, setAction] = useState("");

    const refetch = useCallback(() => {
        setLocalNonce((n) => n + 1);
        onScheduleChanged?.();
    }, [onScheduleChanged]);

    useEffect(() => {
        if (!lease._id) return;
        let cancelled = false;
        void apiClient
            .post<TableResponse<RentalPayment>>("/api/realEstate/rentalPayment", {
                offset: 0,
                limit: 600,
                lease: lease._id,
                sortBy: "dueDate",
                sortOrder: "asc",
            } satisfies TableForm & {lease: string})
            .then((res) => {
                if (!cancelled) setPayments(res.data.data);
            });
        return () => {
            cancelled = true;
        };
    }, [lease._id, refreshNonce, localNonce]);

    useEffect(() => {
        if (requestedAction === RECORD_RENT_PAYMENT_ACTION) {
            setAction(RECORD_RENT_PAYMENT_ACTION);
            onRequestedActionHandled?.();
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
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{rk("schedule.title")}</p>
                {lease.status === "active" && !!paymentAccess.write && (
                    <Button
                        type="button"
                        size="sm"
                        onClick={() => setAction(RECORD_RENT_PAYMENT_ACTION)}
                    >
                        {rk("schedule.recordPayment")}
                    </Button>
                )}
            </div>

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
                        const styles = statusStyles(row.status);
                        const canPay = OPEN_STATUSES.has(row.status ?? "") && (row.remaining ?? 0) > 0;
                        return (
                            <button
                                key={row._id}
                                type="button"
                                title={`${row.dueDate} · ${resolveStatusLabel(resolveLanguageKey, row.status)}`}
                                className={cn("size-5 rounded-sm border border-border/40", styles.cell, canPay && "cursor-pointer")}
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
                                const styles = statusStyles(row.status);
                                const showPay = OPEN_STATUSES.has(row.status ?? "") && (row.remaining ?? 0) > 0 && !!paymentAccess.write;
                                const showEmails = canReadTenant && rentHasVisibleManualEmailActions(row);
                                const showMenu = showPay || showEmails;
                                return (
                                    <TableRow key={row._id}>
                                        <TableCell className="whitespace-nowrap">
                                            {row.dueDate ? format(new Date(row.dueDate), "dd MMM yyyy") : "—"}
                                        </TableCell>
                                        <TableCell className="tabular-nums">{money(row.amount, symbol)}</TableCell>
                                        <TableCell className="tabular-nums">{money(row.lateFeeAmount ?? 0, symbol)}</TableCell>
                                        <TableCell className="tabular-nums">{money(row.paidAmount ?? 0, symbol)}</TableCell>
                                        <TableCell className="tabular-nums">{money(row.remaining, symbol)}</TableCell>
                                        <TableCell>
                                            <Badge className={cn("border", styles.bg, styles.text, styles.border)} variant="outline">
                                                {resolveStatusLabel(resolveLanguageKey, row.status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {showMenu ? (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button type="button" variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                                        <MarkRentalPaymentPaid
                                                            payment={row}
                                                            onAction={(next) => {
                                                                setSelected(row);
                                                                setAction(next);
                                                            }}
                                                        />
                                                        <WaiveRentalPayment
                                                            payment={row}
                                                            onAction={(next) => {
                                                                setSelected(row);
                                                                setAction(next);
                                                            }}
                                                        />
                                                        {showEmails ? (
                                                            <ManualRentClientEmails leaseId={lease._id} payment={row} />
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
