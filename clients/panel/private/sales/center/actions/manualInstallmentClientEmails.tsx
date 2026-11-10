import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useImperativeHandle, useMemo, useState} from "react";
import {DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {IconLoader2, IconMail} from "@tabler/icons-react";
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
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {calendarDaysUntil} from "@coreModule/helpers/general/dateTime.ts";
import {useCompanyTimeZone} from "@coreModule/helpers/hooks/useCompanyTimeZone.ts";
import type {PaymentPlan} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/paymentPlan/paymentPlan.dto.ts";
import type {ManualSaleClientEmailForm} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/sale/manualSaleClientEmail.form.type.ts";

export type InstallmentRowForEmail = PaymentPlan["installments"][number];

type ManualInstallmentClientEmailsProps = WithLanguageType &
    WithAxiosType<{ ok: true }, ManualSaleClientEmailForm> & {
        saleId: string;
        installment: InstallmentRowForEmail;
    };

function isInstallmentPaidRow(installment: InstallmentRowForEmail): boolean {
    const status = installment.status?.toLowerCase();
    if (status === "paid") {
        return true;
    }
    return (installment.paidAmount ?? 0) >= (installment.amount ?? 0) && (installment.amount ?? 0) > 0;
}

type InstallmentOnlyAction = Exclude<ManualSaleClientEmailForm["action"], "send_sale_confirmation">;

/** Which reminders fit the installment; days count from the company's today in `timeZone` (D116), as the server's do. */
export function installmentEmailVisibility(installment: InstallmentRowForEmail, timeZone: string): Record<InstallmentOnlyAction, boolean> {
    const base: Record<InstallmentOnlyAction, boolean> = {
        installment_remind_3d: false,
        installment_remind_1d: false,
        installment_remind_today: false,
        installment_remind_remaining_days: false,
        installment_send_overdue: false,
    };
    const diff = calendarDaysUntil(installment.dueDate, timeZone);
    if (diff === null || isInstallmentPaidRow(installment)) {
        return base;
    }
    return {
        installment_remind_3d: diff >= 3,
        installment_remind_1d: diff >= 1,
        installment_remind_today: diff === 0,
        installment_remind_remaining_days: diff >= 0,
        installment_send_overdue: diff < 0,
    };
}

export const INSTALLMENT_MANUAL_EMAIL_ACTION_ORDER: InstallmentOnlyAction[] = [
    "installment_remind_3d",
    "installment_remind_1d",
    "installment_remind_today",
    "installment_remind_remaining_days",
    "installment_send_overdue",
];

export function installmentHasVisibleManualEmailActions(installment: InstallmentRowForEmail, timeZone: string): boolean {
    const v = installmentEmailVisibility(installment, timeZone);
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

    const timeZone = useCompanyTimeZone();
    const vis = useMemo(() => installmentEmailVisibility(installment, timeZone), [installment, timeZone]);

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
                        <IconMail className="h-4 w-4" />
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
                            {loading ? <IconLoader2 className="animate-spin h-4 w-4" /> : null}
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
    withDebug(true, true, "sales"),
)(ManualInstallmentClientEmails);
