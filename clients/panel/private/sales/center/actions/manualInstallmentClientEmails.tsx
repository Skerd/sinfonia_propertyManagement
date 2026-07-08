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
import type {PaymentPlan} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/paymentPlan/paymentPlan.dto.ts";
import type {ManualSaleClientEmailForm} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/sale/manualSaleClientEmail.form.type.ts";

export type InstallmentRowForEmail = PaymentPlan["installments"][number];

type ManualInstallmentClientEmailsProps = WithLanguageType &
    WithAxiosType<{ ok: true }, ManualSaleClientEmailForm> & {
        saleId: string;
        installment: InstallmentRowForEmail;
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

function isInstallmentPaidRow(installment: InstallmentRowForEmail): boolean {
    const status = installment.status?.toLowerCase();
    if (status === "paid") {
        return true;
    }
    return (installment.paidAmount ?? 0) >= (installment.amount ?? 0) && (installment.amount ?? 0) > 0;
}

type InstallmentOnlyAction = Exclude<ManualSaleClientEmailForm["action"], "send_sale_confirmation">;

export function installmentEmailVisibility(installment: InstallmentRowForEmail): Record<InstallmentOnlyAction, boolean> {
    const base: Record<InstallmentOnlyAction, boolean> = {
        installment_remind_3d: false,
        installment_remind_1d: false,
        installment_remind_today: false,
        installment_remind_remaining_days: false,
        installment_send_overdue: false,
    };
    if (!installment.dueDate || isInstallmentPaidRow(installment)) {
        return base;
    }
    const diff = utcCalendarDaysUntilDueDay(installment.dueDate);
    const past = isPastDueUtcEndOfDay(installment.dueDate);
    return {
        installment_remind_3d: diff >= 3,
        installment_remind_1d: diff >= 1,
        installment_remind_today: diff === 0 && !past,
        installment_remind_remaining_days: !past && diff >= 0,
        installment_send_overdue: past,
    };
}

export const INSTALLMENT_MANUAL_EMAIL_ACTION_ORDER: InstallmentOnlyAction[] = [
    "installment_remind_3d",
    "installment_remind_1d",
    "installment_remind_today",
    "installment_remind_remaining_days",
    "installment_send_overdue",
];

export function installmentHasVisibleManualEmailActions(installment: InstallmentRowForEmail): boolean {
    const v = installmentEmailVisibility(installment);
    return INSTALLMENT_MANUAL_EMAIL_ACTION_ORDER.some((a) => v[a]);
}

function ManualInstallmentClientEmails({
    saleId,
    installment,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    loading,
}: ManualInstallmentClientEmailsProps) {
    const [open, setOpen] = useState(false);
    const [pending, setPending] = useState<InstallmentOnlyAction | null>(null);

    const {read} = useAccess("sales");
    const readFields = (typeof read === "object" && read !== null ? read : {}) as Record<string, unknown>;
    const canReadBuyer = readFields.buyer !== undefined;

    const vis = useMemo(() => installmentEmailVisibility(installment), [installment]);

    useImperativeHandle(innerRef, () => ({
        success: () => {
            setOpen(false);
            setPending(null);
        },
    }));

    if (!canReadBuyer) {
        return null;
    }

    const openDialog = (action: InstallmentOnlyAction) => {
        setPending(action);
        setOpen(true);
    };

    const handleConfirm = () => {
        if (!pending) {
            return;
        }
        onFilterChange({
            _id: saleId,
            action: pending,
            installmentNumber: installment.installmentNumber,
        });
    };

    const anyVisible = INSTALLMENT_MANUAL_EMAIL_ACTION_ORDER.some((a) => vis[a]);
    if (!anyVisible) {
        return null;
    }

    const pendingConfirmKey = pending ? `confirmDescriptions.${pending}` : "";

    return (
        <>
            <DropdownMenuSeparator />
            {INSTALLMENT_MANUAL_EMAIL_ACTION_ORDER.map((action) =>
                vis[action] ? (
                    <DropdownMenuItem
                        key={action}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openDialog(action);
                        }}
                    >
                        <Mail className="h-4 w-4" />
                        <span>{resolveLanguageKey(`actionLabels.${action}`)}</span>
                        <DropdownMenuShortcut className="opacity-0 w-0 p-0 m-0 border-0" aria-hidden />
                    </DropdownMenuItem>
                ) : null,
            )}
            <AlertDialog
                open={open}
                onOpenChange={(v) => {
                    setOpen(v);
                    if (!v) {
                        setPending(null);
                    }
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
                        <AlertDialogAction onClick={handleConfirm} disabled={loading || !pending}>
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
    withLanguage("src/modules/propertyManagement/clients/panel/private/sales/center/actions/manualInstallmentClientEmails.tsx"),
    withAxios(
        {
            method: "POST",
            url: "/api/realEstate/unit/sale/manualClientEmail",
            data: {},
        },
        true,
    ),
    withDebug(true, true),
)(ManualInstallmentClientEmails);
