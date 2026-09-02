import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useImperativeHandle, useMemo, useState} from "react";
import {DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {LoaderCircle, Mail} from "lucide-react";
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
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {RentalPayment} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalPayment/rentalPayment.dto.ts";
import type {RentReminderKind} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/sendRentReminder.form.validator.ts";

type SendRentReminderForm = {
    _id: string;
    rentalPaymentId: string;
    kind: RentReminderKind;
};

type ManualRentClientEmailsProps = WithLanguageType &
    WithAxiosType<{ok: true}, SendRentReminderForm> & {
        leaseId: string;
        payment: RentalPayment;
    };

function utcCalendarDaysUntilDueDay(iso: string): number {
    const due = new Date(iso);
    const dueStart = Date.UTC(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate());
    const n = new Date();
    const todayStart = Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
    return Math.round((dueStart - todayStart) / 86400000);
}

function isPastDueUtcEndOfDay(iso: string): boolean {
    const due = new Date(iso);
    const end = Date.UTC(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate(), 23, 59, 59, 999);
    return Date.now() > end;
}

const OPEN_STATUSES = new Set(["pending", "overdue", "partially_paid"]);

export function rentEmailVisibility(payment: RentalPayment): Record<RentReminderKind, boolean> {
    const base: Record<RentReminderKind, boolean> = {
        "3d": false,
        "1d": false,
        "0d": false,
        overdue: false,
    };
    if (!payment.dueDate || !OPEN_STATUSES.has(payment.status ?? "") || (payment.remaining ?? 0) <= 0) {
        return base;
    }
    const diff = utcCalendarDaysUntilDueDay(payment.dueDate);
    const past = isPastDueUtcEndOfDay(payment.dueDate);
    return {
        "3d": diff >= 3,
        "1d": diff >= 1,
        "0d": diff === 0 && !past,
        overdue: past,
    };
}

export const RENT_MANUAL_EMAIL_KIND_ORDER: RentReminderKind[] = ["3d", "1d", "0d", "overdue"];

export function rentHasVisibleManualEmailActions(payment: RentalPayment): boolean {
    const v = rentEmailVisibility(payment);
    return RENT_MANUAL_EMAIL_KIND_ORDER.some((kind) => v[kind]);
}

function ManualRentClientEmails({
    leaseId,
    payment,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    loading,
}: ManualRentClientEmailsProps) {
    const [open, setOpen] = useState(false);
    const [pending, setPending] = useState<RentReminderKind | null>(null);

    const {read} = useAccess("leases");
    const readFields = (typeof read === "object" && read !== null ? read : {}) as Record<string, unknown>;
    const canReadTenant = readFields.tenant !== undefined;

    const vis = useMemo(() => rentEmailVisibility(payment), [payment]);

    useImperativeHandle(innerRef, () => ({
        success: () => {
            setOpen(false);
            setPending(null);
        },
    }));

    if (!canReadTenant) {
        return null;
    }

    const anyVisible = RENT_MANUAL_EMAIL_KIND_ORDER.some((kind) => vis[kind]);
    if (!anyVisible) {
        return null;
    }

    const pendingConfirmKey = pending ? `confirmDescriptions.${pending}` : "";

    return (
        <>
            <DropdownMenuSeparator />
            {RENT_MANUAL_EMAIL_KIND_ORDER.map((kind) =>
                vis[kind] ? (
                    <DropdownMenuItem
                        key={kind}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setPending(kind);
                            setOpen(true);
                        }}
                    >
                        <Mail className="h-4 w-4" />
                        <span>{resolveLanguageKey(`actionLabels.${kind}`)}</span>
                        <DropdownMenuShortcut className="opacity-0 w-0 p-0 m-0 border-0" aria-hidden />
                    </DropdownMenuItem>
                ) : null,
            )}
            <AlertDialog
                open={open}
                onOpenChange={(v) => {
                    setOpen(v);
                    if (!v) setPending(null);
                }}
            >
                <AlertDialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {pending ? resolveLanguageKey(`confirmTitles.${pending}`) : ""}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {pending ? resolveLanguageKey(pendingConfirmKey) : ""}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={loading}
                            onClick={() => {
                                setPending(null);
                            }}
                        >
                            {resolveLanguageKey("cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (!pending) return;
                                onFilterChange({
                                    _id: leaseId,
                                    rentalPaymentId: payment._id,
                                    kind: pending,
                                });
                            }}
                            disabled={loading || !pending}
                        >
                            {loading ? <LoaderCircle className="animate-spin h-4 w-4" /> : null}
                            {resolveLanguageKey("confirmSend")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/leases/center/actions/manualRentClientEmails.tsx"),
    withAxios(
        {
            method: "POST",
            url: "/api/realEstate/lease/sendRentReminder",
            data: {},
        },
        true,
    ),
    withDebug(true, true, "leases"),
)(ManualRentClientEmails);
