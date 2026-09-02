import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useEffect, useImperativeHandle, useMemo, useRef, useState} from "react";
import {toast} from "sonner";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";
import {DollarSign, LoaderCircle} from "lucide-react";
import FormMaxLengthControl from "@coreModule/components/custom/formMaxLengthControl.tsx";
import {LEASE_LONG_TEXT_MAX} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/lease.schema-def.ts";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@coreModule/components/ui/alert-dialog.tsx";
import type {Lease} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/lease.dto.ts";
import type {RentalPayment} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalPayment/rentalPayment.dto.ts";
import type {TableForm, TableResponse} from "armonia/src/modules/core/types/shared.types.ts";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";

const OPEN_STATUSES = new Set(["pending", "overdue", "partially_paid"]);

type RecordRentPaymentPayload = {
    _id: string;
    paidAmount: number;
    notes?: string;
};

type RecordRentPaymentDialogProps = WithLanguageType &
    WithAxiosType<Lease, RecordRentPaymentPayload> & {
        open: boolean;
        onClose: () => void;
        lease: Lease;
        payments?: RentalPayment[];
        onSuccess?: (updated?: Lease) => void;
    };

function RecordRentPaymentDialog({
    lease,
    payments: paymentsProp,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    data,
    onSuccess = () => {},
    loading,
}: RecordRentPaymentDialogProps) {
    const [paidAmount, setPaidAmount] = useState("");
    const [notes, setNotes] = useState("");
    const [fetched, setFetched] = useState<RentalPayment[] | null>(null);
    const waitingForSuccessRef = useRef(false);
    const previousDataRef = useRef<Lease | null>(null);

    useEffect(() => {
        if (!open) return;
        setPaidAmount("");
        setNotes("");
        if (paymentsProp) {
            setFetched(null);
            return;
        }
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
                if (!cancelled) setFetched(res.data.data);
            })
            .catch(() => {
                if (!cancelled) setFetched([]);
            });
        return () => {
            cancelled = true;
        };
    }, [open, lease._id, paymentsProp]);

    const openMonths = useMemo(() => {
        const rows = paymentsProp ?? fetched ?? [];
        return rows
            .filter((row) => OPEN_STATUSES.has(row.status ?? "") && (row.remaining ?? 0) > 0)
            .slice()
            .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    }, [paymentsProp, fetched]);

    const openRemaining = openMonths.reduce((sum, row) => sum + (row.remaining ?? 0), 0);
    const symbol = lease.rentCurrency?.symbol ?? openMonths[0]?.currency?.symbol;

    const preview = useMemo(() => {
        let leftover = Number(paidAmount);
        if (!Number.isFinite(leftover) || leftover <= 0) return [];
        const slices: {dueDate: string; slice: number}[] = [];
        for (const row of openMonths) {
            if (leftover <= 0) break;
            const rem = row.remaining ?? 0;
            const slice = leftover < rem ? leftover : rem;
            slices.push({dueDate: row.dueDate, slice});
            leftover -= slice;
        }
        return slices;
    }, [paidAmount, openMonths]);

    const leftoverAfter = useMemo(() => {
        const paid = Number(paidAmount);
        if (!Number.isFinite(paid) || paid <= 0) return 0;
        const applied = preview.reduce((sum, row) => sum + row.slice, 0);
        return paid - applied;
    }, [paidAmount, preview]);

    useEffect(() => {
        if (waitingForSuccessRef.current && data && data !== previousDataRef.current) {
            previousDataRef.current = data;
            waitingForSuccessRef.current = false;
            onClose();
            onSuccess(data);
        }
    }, [data, onClose, onSuccess]);

    useImperativeHandle(innerRef, () => ({
        success: () => {
            toast.success(resolveLanguageKey("paymentRecorded"));
            waitingForSuccessRef.current = true;
        },
        error: () => {
            toast.error(resolveLanguageKey("paymentFailed"));
            waitingForSuccessRef.current = false;
        },
    }));

    const canSubmit = !!paidAmount && Number(paidAmount) > 0 && openRemaining > 0;

    return (
        <AlertDialog
            open={open}
            onOpenChange={(next) => {
                if (!next && !loading) onClose();
            }}
        >
            <AlertDialogContent
                className="flex max-h-[85vh] w-[calc(100%-2rem)] flex-col overflow-hidden data-[size=default]:max-w-xl data-[size=default]:sm:max-w-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <AlertDialogHeader className="shrink-0">
                    <AlertDialogTitle>{resolveLanguageKey("dialogTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {resolveLanguageKey("dialogDescription").replace(
                            "{remaining}",
                            openRemaining.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
                                + (symbol ? ` ${symbol}` : ""),
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex min-h-0 flex-1 flex-col gap-y-3 overflow-y-auto py-2">
                    <div className="flex flex-col gap-y-2">
                        <Label htmlFor="fifoPaidAmount">{resolveLanguageKey("paidAmount")} *</Label>
                        <Input
                            id="fifoPaidAmount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={paidAmount}
                            onChange={(e) => setPaidAmount(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    {preview.length > 0 && (
                        <ul className="rounded-md border border-border/50 bg-muted/20 p-2 text-xs">
                            {preview.map((row) => (
                                <li key={row.dueDate} className="flex justify-between gap-2 py-0.5 tabular-nums">
                                    <span>{row.dueDate}</span>
                                    <span>
                                        {row.slice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                        {symbol ? ` ${symbol}` : ""}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                    {leftoverAfter > 0.005 && (
                        <p className="text-xs text-destructive">{resolveLanguageKey("leftoverWarning")}</p>
                    )}
                    <div className="flex min-h-0 flex-col gap-y-2">
                        <Label htmlFor="fifoNotes">{resolveLanguageKey("notes")}</Label>
                        <FormMaxLengthControl maxLength={LEASE_LONG_TEXT_MAX} value={notes}>
                            <Textarea
                                id="fifoNotes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value.slice(0, LEASE_LONG_TEXT_MAX))}
                                placeholder={resolveLanguageKey("notesPlaceholder")}
                                disabled={loading}
                                maxLength={LEASE_LONG_TEXT_MAX}
                                className="field-sizing-fixed min-h-[120px] max-h-56 overflow-y-auto resize-none"
                            />
                        </FormMaxLengthControl>
                    </div>
                </div>
                <AlertDialogFooter className="shrink-0">
                    <AlertDialogCancel disabled={loading} onClick={(e) => e.stopPropagation()}>
                        {resolveLanguageKey("cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (!canSubmit) return;
                            onFilterChange({
                                _id: lease._id,
                                paidAmount: Number(paidAmount),
                                notes: notes || undefined,
                            });
                        }}
                        disabled={loading || !canSubmit}
                    >
                        {loading ? (
                            <>
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                {resolveLanguageKey("processing")}
                            </>
                        ) : (
                            <>
                                <DollarSign className="mr-2 h-4 w-4" />
                                {resolveLanguageKey("confirmPay")}
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/leases/recordRentPaymentDialog.tsx"),
    withAxios(
        {
            method: "POST",
            url: "/api/realEstate/lease/recordRentPayment",
            data: {},
        },
        true,
    ),
    withDebug(true, true, "leases"),
)(RecordRentPaymentDialog);
