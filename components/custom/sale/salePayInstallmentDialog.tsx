import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useEffect, useImperativeHandle, useRef, useState} from "react";
import {toast} from "sonner";
import {PayInstallmentFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/paymentPlan/payInstallment.form.type.ts";
import {PaymentPlan as PaymentPlanData} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/paymentPlan/paymentPlan.dto.ts";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";
import {DollarSign, LoaderCircle} from "lucide-react";
import FormMaxLengthControl from "@coreModule/components/custom/formMaxLengthControl.tsx";
import {SALE_LONG_TEXT_MAX, SALE_SHORT_TEXT_MAX} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/sale/sale.schema-def.ts";
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
import type {PaymentPlan} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/paymentPlan/paymentPlan.dto.ts";

type SalePayInstallmentDialogProps = WithLanguageType & WithAxiosType<PaymentPlanData, PayInstallmentFormType> & {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    paymentPlanId: string;
    installment: PaymentPlan["installments"][number] | null;
    onSuccess?: (updatedPaymentPlan: PaymentPlanData) => void;
};

function SalePayInstallmentDialog({
    open,
    onOpenChange,
    paymentPlanId,
    installment,
    resolveLanguageKey,
    loading,
    innerRef,
    onFilterChange,
    data,
    onSuccess = () => {},
}: SalePayInstallmentDialogProps) {
    const [paidAmount, setPaidAmount] = useState<string>("");
    const [transactionId, setTransactionId] = useState<string>("");
    const [notes, setNotes] = useState<string>("");
    const waitingForSuccessRef = useRef(false);
    const previousDataRef = useRef<PaymentPlanData | null>(null);

    const amount = installment?.amount ?? 0;
    const alreadyPaid = installment?.paidAmount ?? 0;
    const remainingAmount = amount - alreadyPaid;
    const defaultAmount = remainingAmount > 0 ? remainingAmount.toString() : amount.toString();

    useEffect(() => {
        if (open && installment) {
            setPaidAmount(defaultAmount);
            setTransactionId("");
            setNotes("");
        }
    }, [open, installment, defaultAmount]);

    useEffect(() => {
        if (waitingForSuccessRef.current && data && data !== previousDataRef.current) {
            previousDataRef.current = data;
            waitingForSuccessRef.current = false;
            onOpenChange(false);
            onSuccess(data);
        }
    }, [data, onOpenChange, onSuccess]);

    useImperativeHandle(innerRef, () => ({
        success: () => {
            toast.success(resolveLanguageKey("paymentRecorded") || "Payment recorded successfully");
            waitingForSuccessRef.current = true;
        },
        error: () => {
            toast.error(resolveLanguageKey("paymentFailed") || "Failed to record payment");
            waitingForSuccessRef.current = false;
        },
    }));

    const canSubmit = !!paidAmount && Number(paidAmount) > 0 && !!installment;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent
                className="flex max-h-[85vh] w-[calc(100%-2rem)] flex-col overflow-hidden data-[size=default]:max-w-xl data-[size=default]:sm:max-w-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <AlertDialogHeader className="shrink-0">
                    <AlertDialogTitle>{resolveLanguageKey("payInstallmentTitle") || "Pay Installment"}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {resolveLanguageKey("payInstallmentDescription") || `Record payment for installment #${installment?.installmentNumber ?? ""}`}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex min-h-0 flex-1 flex-col gap-y-4 overflow-y-auto py-4">
                    <div className="flex flex-col gap-y-2">
                        <Label htmlFor="paidAmount">{resolveLanguageKey("paidAmount") || "Paid Amount"} *</Label>
                        <Input
                            id="paidAmount"
                            type="number"
                            step="0.01"
                            value={paidAmount}
                            onChange={(e) => setPaidAmount(e.target.value)}
                            placeholder={defaultAmount}
                            disabled={loading}
                        />
                        <p className="text-xs text-muted-foreground">
                            {resolveLanguageKey("remainingAmount") || "Remaining"}: {Math.max(0, remainingAmount).toLocaleString()}
                        </p>
                    </div>
                    <div className="flex flex-col gap-y-2">
                        <Label htmlFor="transactionId">{resolveLanguageKey("transactionId") || "Transaction ID"}</Label>
                        <FormMaxLengthControl maxLength={SALE_SHORT_TEXT_MAX} value={transactionId}>
                            <Input
                                id="transactionId"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value.slice(0, SALE_SHORT_TEXT_MAX))}
                                placeholder={resolveLanguageKey("transactionIdPlaceholder") || "Optional"}
                                disabled={loading}
                                maxLength={SALE_SHORT_TEXT_MAX}
                            />
                        </FormMaxLengthControl>
                    </div>
                    <div className="flex min-h-0 flex-col gap-y-2">
                        <Label htmlFor="notes">{resolveLanguageKey("notes") || "Notes"}</Label>
                        <FormMaxLengthControl maxLength={SALE_LONG_TEXT_MAX} value={notes}>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value.slice(0, SALE_LONG_TEXT_MAX))}
                                placeholder={resolveLanguageKey("notesPlaceholder") || "Optional"}
                                disabled={loading}
                                maxLength={SALE_LONG_TEXT_MAX}
                                className="field-sizing-fixed min-h-[120px] max-h-56 overflow-y-auto resize-none"
                            />
                        </FormMaxLengthControl>
                    </div>
                </div>
                <AlertDialogFooter className="shrink-0">
                    <AlertDialogCancel disabled={loading} onClick={(e) => e.stopPropagation()}>
                        {resolveLanguageKey("cancel") || "Cancel"}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (!canSubmit || !installment) return;
                            onFilterChange({
                                _id: paymentPlanId,
                                installmentNumber: installment.installmentNumber,
                                paidAmount: Number(paidAmount),
                                transactionId: transactionId || undefined,
                                notes: notes || undefined,
                            });
                        }}
                        disabled={loading || !canSubmit}
                    >
                        {loading ? (
                            <>
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                {resolveLanguageKey("processing") || "Processing..."}
                            </>
                        ) : (
                            <>
                                <DollarSign className="mr-2 h-4 w-4" />
                                {resolveLanguageKey("confirmPay") || "Confirm Payment"}
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/sale/salePayInstallmentDialog.tsx"),
    withAxios(
        {url: "/api/realEstate/unit/sale/payInstallment", method: "post", data: {}},
        true,
    ),
    withDebug(true, true, ["paymentPlans", "sales"]),
)(SalePayInstallmentDialog);
